-- Script untuk debug invite code issue

-- 1. Cek semua invite code yang ada
SELECT 
  id,
  invite_code,
  status,
  user1_id,
  user2_id,
  linked_at,
  created_at
FROM couples
ORDER BY created_at DESC;

-- 2. Cek invite code pending (yang bisa dipakai)
SELECT 
  'Pending invites' as type,
  invite_code,
  user1_id,
  created_at
FROM couples
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 3. Cek invite code active (sudah dipakai)
SELECT 
  'Active couples' as type,
  invite_code,
  user1_id,
  user2_id,
  linked_at
FROM couples
WHERE status = 'active'
ORDER BY linked_at DESC;

-- 4. Cek apakah ada user yang sudah punya couple
SELECT 
  p.display_name,
  p.user_id,
  CASE 
    WHEN c.id IS NOT NULL THEN '✅ Already in couple'
    ELSE '⚠️ No couple yet'
  END as couple_status,
  c.status as couple_status_detail
FROM profiles p
LEFT JOIN couples c ON (p.user_id = c.user1_id OR p.user_id = c.user2_id)
ORDER BY p.created_at DESC;

-- 5. Cek apakah ada duplikat invite_code
SELECT 
  invite_code,
  COUNT(*) as count
FROM couples
GROUP BY invite_code
HAVING COUNT(*) > 1;
