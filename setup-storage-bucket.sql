-- Script untuk setup Supabase Storage bucket untuk avatars
-- Jalankan di Supabase SQL Editor

-- ============================================
-- 1. CREATE BUCKET (jika belum ada)
-- ============================================
-- CATATAN: Bucket biasanya dibuat via Supabase Dashboard UI
-- Tapi jika ingin via SQL, bisa pakai query ini:

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. SET BUCKET POLICIES
-- ============================================

-- Policy: Semua orang bisa melihat avatar (READ)
CREATE POLICY "Public avatar read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: User hanya bisa upload/update avatar mereka sendiri (INSERT)
CREATE POLICY "User can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: User bisa update avatar mereka sendiri (UPDATE)
CREATE POLICY "User can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: User bisa delete avatar mereka sendiri (DELETE)
CREATE POLICY "User can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 3. VERIFIKASI
-- ============================================

-- Cek bucket ada
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Cek policies
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects';

-- ============================================
-- ALTERNATIVE: Setup via Dashboard (RECOMMENDED)
-- ============================================

/*
Lebih mudah setup via Supabase Dashboard:

1. Buka Supabase Dashboard
2. Storage → Create new bucket
3. Bucket name: avatars
4. Public bucket: YES (checked)
5. Klik Create

Policies akan otomatis dibuat!
*/

-- ============================================
-- TESTING UPLOAD (via Console)
-- ============================================

/*
Test di browser console setelah login:

const { data, error } = await supabase.storage
  .from('avatars')
  .upload('test/test.jpg', file, { upsert: true })

console.log('Upload result:', data, error)
*/
