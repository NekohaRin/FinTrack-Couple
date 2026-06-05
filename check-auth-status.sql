-- Script untuk mengecek status autentikasi
-- Jalankan di Supabase SQL Editor untuk diagnostic

-- ============================================
-- 1. RINGKASAN JUMLAH DATA
-- ============================================
SELECT 
  'Total Users in auth.users' as label,
  COUNT(*) as count
FROM auth.users

UNION ALL

SELECT 
  'Total Profiles' as label,
  COUNT(*) as count
FROM public.profiles

UNION ALL

SELECT 
  'Confirmed Users' as label,
  COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NOT NULL

UNION ALL

SELECT 
  'Unconfirmed Users' as label,
  COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NULL

UNION ALL

SELECT 
  'Active Couples' as label,
  COUNT(*) as count
FROM public.couples
WHERE status = 'active';

-- ============================================
-- 2. USER TANPA PROFILE (MASALAH!)
-- ============================================
SELECT 
  '⚠️ Users without profile (PROBLEM!)' as issue,
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY u.created_at DESC;

-- ============================================
-- 3. USER BELUM CONFIRMED
-- ============================================
SELECT 
  '⚠️ Unconfirmed users' as issue,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- ============================================
-- 4. CEK TRIGGER HANDLE_NEW_USER
-- ============================================
SELECT 
  'Trigger Status' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ) 
    THEN '✅ Trigger exists'
    ELSE '❌ Trigger NOT found - RUN fix-auth-setup.sql!'
  END as status;

-- ============================================
-- 5. CEK RLS POLICIES
-- ============================================
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'couples', 'categories', 'transactions', 'budgets', 'shared_wallet', 'wishlist_items')
ORDER BY tablename;

-- ============================================
-- 6. USER TERBARU (untuk testing)
-- ============================================
SELECT 
  u.email,
  u.created_at,
  u.email_confirmed_at,
  CASE 
    WHEN p.user_id IS NOT NULL THEN '✅ Has profile'
    ELSE '❌ No profile'
  END as profile_status,
  CASE 
    WHEN c.id IS NOT NULL THEN '✅ Has couple'
    ELSE '⚠️ No couple (normal for new user)'
  END as couple_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.couples c ON (u.id = c.user1_id OR u.id = c.user2_id) AND c.status = 'active'
ORDER BY u.created_at DESC
LIMIT 10;
