-- Script untuk membuat tabel savings (Tabungan Berdua)
-- Jalankan di Supabase SQL Editor

-- ============================================
-- 1. BUAT TABEL SAVINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.savings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  added_by uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount numeric(15,2) NOT NULL,
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. ENABLE RLS
-- ============================================

ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Policy: Couple bisa CRUD savings mereka
CREATE POLICY "Couples can manage savings"
  ON public.savings
  FOR ALL
  USING (
    couple_id IN (
      SELECT id FROM public.couples
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
        AND status = 'active'
    )
  );

-- ============================================
-- 4. CREATE INDEX untuk performa
-- ============================================

CREATE INDEX IF NOT EXISTS savings_couple_id_idx ON public.savings(couple_id);
CREATE INDEX IF NOT EXISTS savings_date_idx ON public.savings(date DESC);
CREATE INDEX IF NOT EXISTS savings_created_at_idx ON public.savings(created_at DESC);

-- ============================================
-- 5. VERIFIKASI
-- ============================================

-- Cek tabel sudah dibuat
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'savings'
ORDER BY ordinal_position;

-- Cek RLS enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'savings';

-- Cek policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'savings';

-- ============================================
-- SELESAI!
-- ============================================
-- Setelah menjalankan script ini, tabel savings siap digunakan
