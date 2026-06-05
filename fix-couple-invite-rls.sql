-- Script untuk memperbaiki RLS policy tabel couples
-- Masalah: User kedua tidak bisa query invite_code yang dibuat user pertama

-- ============================================
-- ANALISIS MASALAH
-- ============================================
-- Skenario:
-- 1. User A (user1_id) membuat invite code → status: pending
-- 2. User B mencoba join dengan kode tersebut
-- 3. Query dari User B: SELECT * FROM couples WHERE invite_code = 'XXXXX' AND status = 'pending'
-- 4. RLS policy saat ini: USING (auth.uid() = user1_id OR auth.uid() = user2_id)
-- 5. Problem: User B belum ada di user2_id (masih NULL), jadi RLS DENY access!

-- ============================================
-- SOLUSI: UPDATE RLS POLICY
-- ============================================

-- 1. Drop policy lama yang terlalu ketat
DROP POLICY IF EXISTS "Users can manage own couples" ON public.couples;

-- 2. Buat policy baru yang lebih fleksibel

-- Policy A: Owner (user1) bisa CRUD couple mereka
CREATE POLICY "Owner can manage couple"
  ON public.couples
  FOR ALL
  USING (auth.uid() = user1_id);

-- Policy B: Partner (user2) bisa CRUD couple mereka (setelah join)
CREATE POLICY "Partner can manage couple"
  ON public.couples
  FOR ALL
  USING (auth.uid() = user2_id);

-- Policy C: SEMUA ORANG bisa READ couple dengan status PENDING untuk join
-- Ini penting agar user B bisa query invite_code user A
CREATE POLICY "Anyone can view pending invites"
  ON public.couples
  FOR SELECT
  USING (status = 'pending');

-- Policy D: User yang sudah join (user2) bisa UPDATE untuk activate couple
-- Ini untuk proses joinWithCode yang update status dari pending ke active
CREATE POLICY "User can join pending invite"
  ON public.couples
  FOR UPDATE
  USING (
    status = 'pending' OR 
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

-- ============================================
-- ALTERNATIVE: Jika Policy C terlalu permissive
-- ============================================
-- Jika tidak mau semua orang bisa lihat pending invites,
-- bisa pakai policy yang hanya allow SELECT dengan invite_code tertentu
-- Tapi ini tidak bisa di-enforce di RLS level, jadi pakai Policy C saja

-- ============================================
-- VERIFIKASI
-- ============================================

-- Cek semua policies untuk tabel couples
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'couples';

-- Test query sebagai user berbeda
-- (Jalankan ini di Supabase setelah login sebagai user B)
-- SELECT * FROM couples WHERE invite_code = 'XXXXX' AND status = 'pending';
-- Seharusnya sekarang return hasil, bukan error permission denied

-- ============================================
-- CATATAN KEAMANAN
-- ============================================
-- Policy "Anyone can view pending invites" aman karena:
-- 1. Hanya invite dengan status 'pending' yang bisa dilihat
-- 2. Setelah joined, status berubah jadi 'active' → tidak bisa dilihat sembarangan lagi
-- 3. Invite code adalah random string 6 karakter (36^6 = 2 milyar kombinasi)
-- 4. Tidak ada data sensitif di tabel couples saat status pending (user2_id masih NULL)
-- 5. Untuk extra security, bisa tambahkan expiry time untuk invite code

-- ============================================
-- OPTIONAL: Tambah kolom expires_at untuk invite code
-- ============================================
-- ALTER TABLE public.couples ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
-- UPDATE public.couples SET expires_at = created_at + INTERVAL '7 days' WHERE status = 'pending';
-- 
-- CREATE POLICY "Anyone can view valid pending invites"
--   ON public.couples
--   FOR SELECT
--   USING (status = 'pending' AND (expires_at IS NULL OR expires_at > NOW()));
