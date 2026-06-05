-- Script untuk memperbaiki setup autentikasi Supabase
-- Jalankan script ini di Supabase SQL Editor

-- ============================================
-- 1. CEK & BUAT TRIGGER PROFILE OTOMATIS
-- ============================================

-- Fungsi untuk membuat profile otomatis saat user baru sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger yang menjalankan fungsi di atas setelah user baru dibuat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. AKTIFKAN ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles: user bisa baca & update profile sendiri
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Profiles: semua user bisa lihat profile pasangannya
DROP POLICY IF EXISTS "Users can view partner profile" ON public.profiles;
CREATE POLICY "Users can view partner profile"
  ON public.profiles FOR SELECT
  USING (
    user_id IN (
      SELECT CASE
        WHEN user1_id = auth.uid() THEN user2_id
        WHEN user2_id = auth.uid() THEN user1_id
      END
      FROM public.couples
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
        AND status = 'active'
    )
  );

-- Couples: user bisa CRUD couple record sendiri
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own couples" ON public.couples;
CREATE POLICY "Users can manage own couples"
  ON public.couples FOR ALL
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Categories: user bisa CRUD kategori sendiri
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
CREATE POLICY "Users can manage own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = owner_id);

-- Transactions: pemilik bisa CRUD
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

-- Transactions: pasangan bisa READ
DROP POLICY IF EXISTS "Partners can view transactions" ON public.transactions;
CREATE POLICY "Partners can view transactions"
  ON public.transactions FOR SELECT
  USING (
    user_id IN (
      SELECT CASE
        WHEN user1_id = auth.uid() THEN user2_id
        WHEN user2_id = auth.uid() THEN user1_id
      END
      FROM public.couples
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
        AND status = 'active'
        AND visibility_consent = true
    )
  );

-- Budgets: user bisa CRUD budget sendiri
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;
CREATE POLICY "Users can manage own budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id);

-- Shared Wallet: hanya couple yang terhubung
ALTER TABLE public.shared_wallet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples can manage shared wallet" ON public.shared_wallet;
CREATE POLICY "Couples can manage shared wallet"
  ON public.shared_wallet FOR ALL
  USING (
    couple_id IN (
      SELECT id FROM public.couples
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
        AND status = 'active'
    )
  );

-- Wishlist: hanya couple yang terhubung
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couples can manage wishlist" ON public.wishlist_items;
CREATE POLICY "Couples can manage wishlist"
  ON public.wishlist_items FOR ALL
  USING (
    couple_id IN (
      SELECT id FROM public.couples
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
        AND status = 'active'
    )
  );

-- ============================================
-- 3. FIX UNTUK USER YANG SUDAH ADA (JIKA PROFILE KOSONG)
-- ============================================

-- Buat profile untuk semua user yang belum punya profile
INSERT INTO public.profiles (user_id, display_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 4. DISABLE EMAIL CONFIRMATION (DEVELOPMENT ONLY)
-- ============================================
-- CATATAN: Ini hanya untuk development
-- Untuk production, sebaiknya aktifkan email confirmation
-- Jalankan query ini untuk melihat setting saat ini:
-- SELECT * FROM auth.config;

-- Untuk disable email confirmation, pergi ke:
-- Supabase Dashboard → Authentication → Settings
-- → Email Auth Provider → "Enable email confirmations" → OFF

-- ============================================
-- SELESAI!
-- ============================================
-- Setelah menjalankan script ini:
-- 1. Test buat akun baru
-- 2. Test login dengan akun yang sudah ada
-- 3. Cek console browser untuk log debug
