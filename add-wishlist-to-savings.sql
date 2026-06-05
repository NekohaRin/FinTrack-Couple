-- ============================================
-- MENAMBAHKAN FIELD wishlist_item_id KE SAVINGS
-- ============================================
-- Script ini menambahkan relasi antara savings dan wishlist_items
-- sehingga setiap saving bisa dikaitkan dengan wishlist tertentu

-- 1. Tambah kolom wishlist_item_id (nullable, karena bisa general saving)
ALTER TABLE public.savings 
ADD COLUMN IF NOT EXISTS wishlist_item_id uuid REFERENCES public.wishlist_items(id) ON DELETE SET NULL;

-- 2. Tambah index untuk performa
CREATE INDEX IF NOT EXISTS savings_wishlist_item_id_idx ON public.savings(wishlist_item_id);

-- 3. Tambah trigger untuk auto-update saved_amount di wishlist_items
-- Ketika ada saving baru/update/delete, otomatis update saved_amount di wishlist

CREATE OR REPLACE FUNCTION update_wishlist_saved_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika ada wishlist_item_id, hitung ulang saved_amount
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.wishlist_item_id IS NOT NULL THEN
      UPDATE public.wishlist_items
      SET saved_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.savings
        WHERE wishlist_item_id = NEW.wishlist_item_id
      )
      WHERE id = NEW.wishlist_item_id;
    END IF;
  END IF;
  
  -- Jika DELETE atau UPDATE yang merubah wishlist_item_id
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.wishlist_item_id IS DISTINCT FROM NEW.wishlist_item_id) THEN
    IF OLD.wishlist_item_id IS NOT NULL THEN
      UPDATE public.wishlist_items
      SET saved_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.savings
        WHERE wishlist_item_id = OLD.wishlist_item_id
      )
      WHERE id = OLD.wishlist_item_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop trigger lama jika ada
DROP TRIGGER IF EXISTS trigger_update_wishlist_saved_amount ON public.savings;

-- Buat trigger baru
CREATE TRIGGER trigger_update_wishlist_saved_amount
AFTER INSERT OR UPDATE OR DELETE ON public.savings
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_saved_amount();

-- ============================================
-- VERIFIKASI
-- ============================================

-- Cek kolom sudah ditambahkan
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'savings' 
  AND column_name = 'wishlist_item_id';

-- Cek trigger sudah dibuat
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_wishlist_saved_amount';

-- ============================================
-- SELESAI!
-- ============================================
-- Sekarang:
-- 1. Saving bisa dikaitkan dengan wishlist tertentu
-- 2. saved_amount di wishlist otomatis update saat ada saving baru/update/delete
-- 3. General saving (tanpa wishlist) tetap bisa dibuat (wishlist_item_id = NULL)
