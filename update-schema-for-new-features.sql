-- Script untuk update schema database sesuai fitur baru
-- Jalankan di Supabase SQL Editor

-- ============================================
-- 1. UPDATE TABEL WISHLIST_ITEMS
-- ============================================

-- Tambah kolom baru untuk wishlist
ALTER TABLE public.wishlist_items 
ADD COLUMN IF NOT EXISTS product_link text,
ADD COLUMN IF NOT EXISTS maps_link text,
ADD COLUMN IF NOT EXISTS emoji text DEFAULT '🎯',
ADD COLUMN IF NOT EXISTS category text DEFAULT 'liburan',
ADD COLUMN IF NOT EXISTS note text;

-- Update existing wishlist items yang belum punya emoji/category
UPDATE public.wishlist_items 
SET emoji = '🎯' 
WHERE emoji IS NULL;

UPDATE public.wishlist_items 
SET category = 'liburan' 
WHERE category IS NULL;

-- ============================================
-- 2. BUAT FUNCTION CREATE DEFAULT CATEGORIES
-- ============================================

CREATE OR REPLACE FUNCTION public.create_default_categories(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.categories (owner_id, name, icon, color, scope) VALUES
    (user_uuid, 'Makanan & Minuman', '🍔', '#FF6B6B', 'personal'),
    (user_uuid, 'Transport', '🚗', '#4ECDC4', 'personal'),
    (user_uuid, 'Belanja', '🛍️', '#FFE66D', 'personal'),
    (user_uuid, 'Tagihan', '📱', '#95E1D3', 'personal'),
    (user_uuid, 'Hiburan', '🎮', '#F38181', 'personal'),
    (user_uuid, 'Kesehatan', '💊', '#A8E6CF', 'personal'),
    (user_uuid, 'Pendidikan', '📚', '#FFAAA5', 'personal'),
    (user_uuid, 'Lainnya', '📦', '#B4A7D6', 'personal')
  ON CONFLICT DO NOTHING;
END;
$$;

-- ============================================
-- 3. UPDATE TRIGGER HANDLE_NEW_USER
-- ============================================

-- Update trigger untuk include default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Buat profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Buat default categories
  PERFORM public.create_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Pastikan trigger masih ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. BUAT DEFAULT CATEGORIES UNTUK USER YANG SUDAH ADA
-- ============================================

-- Create categories untuk semua user yang belum punya
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT user_id 
    FROM public.profiles 
    WHERE user_id NOT IN (
      SELECT DISTINCT owner_id FROM public.categories
    )
  LOOP
    PERFORM public.create_default_categories(user_record.user_id);
    RAISE NOTICE 'Created categories for user: %', user_record.user_id;
  END LOOP;
END $$;

-- ============================================
-- 5. VERIFIKASI
-- ============================================

-- Cek kolom wishlist_items
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'wishlist_items'
  AND column_name IN ('product_link', 'maps_link', 'emoji', 'category', 'note')
ORDER BY column_name;

-- Cek function create_default_categories
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'create_default_categories';

-- Cek trigger on_auth_user_created
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Cek berapa user yang sudah punya categories
SELECT 
  p.display_name,
  COUNT(c.id) as category_count
FROM profiles p
LEFT JOIN categories c ON p.user_id = c.owner_id
GROUP BY p.user_id, p.display_name
ORDER BY category_count ASC;

-- ============================================
-- SELESAI!
-- ============================================
-- Schema sudah diupdate dan siap untuk fitur baru
