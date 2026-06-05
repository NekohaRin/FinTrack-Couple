# 🔧 Fix: Kode Invite Tidak Ditemukan

## 🔍 Masalah

User A membuat kode invite, tapi ketika User B mencoba join dengan kode tersebut, muncul error:
```
"Kode invite tidak ditemukan atau sudah dipakai."
```

Padahal kode invite **belum dipakai** dan **benar**.

---

## 🎯 Akar Masalah

### RLS Policy Terlalu Ketat

Saat ini, RLS policy untuk tabel `couples` adalah:
```sql
CREATE POLICY "Users can manage own couples"
  ON public.couples FOR ALL
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
```

**Skenario yang terjadi:**
1. ✅ User A (login) membuat invite code
   - Insert ke tabel `couples`: `{ user1_id: A, user2_id: NULL, status: 'pending' }`
   - RLS check: `auth.uid() = user1_id` → TRUE ✅
   - Insert berhasil!

2. ❌ User B (login) mencoba join dengan kode
   - Query: `SELECT * FROM couples WHERE invite_code = 'XXX' AND status = 'pending'`
   - RLS check untuk baris tersebut: `auth.uid() = user1_id OR auth.uid() = user2_id`
     - `auth.uid() (User B) = user1_id (User A)` → FALSE ❌
     - `auth.uid() (User B) = user2_id (NULL)` → FALSE ❌
   - RLS DENY access → Query return empty
   - Kode: `if (!couple)` → throw error "Kode tidak ditemukan"

**Kesimpulan:** User B tidak bisa membaca invite code User A karena RLS policy hanya mengizinkan user yang sudah terdaftar di `user1_id` atau `user2_id`.

---

## ✅ Solusi

### Update RLS Policy

Kita perlu policy baru yang mengizinkan **siapapun** membaca invite code yang masih `pending` (untuk proses join):

```sql
-- Policy lama (terlalu ketat)
DROP POLICY IF EXISTS "Users can manage own couples" ON public.couples;

-- Policy baru (lebih fleksibel):

-- 1. Owner bisa manage
CREATE POLICY "Owner can manage couple"
  ON public.couples FOR ALL
  USING (auth.uid() = user1_id);

-- 2. Partner bisa manage (setelah join)
CREATE POLICY "Partner can manage couple"
  ON public.couples FOR ALL
  USING (auth.uid() = user2_id);

-- 3. SEMUA ORANG bisa READ pending invites (untuk join)
CREATE POLICY "Anyone can view pending invites"
  ON public.couples FOR SELECT
  USING (status = 'pending');

-- 4. User bisa UPDATE pending invite (untuk join)
CREATE POLICY "User can join pending invite"
  ON public.couples FOR UPDATE
  USING (
    status = 'pending' OR 
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );
```

**Kenapa aman?**
- ✅ Hanya invite dengan status `pending` yang bisa dilihat semua orang
- ✅ Setelah di-join, status jadi `active` → hanya user1 & user2 yang bisa akses
- ✅ Invite code random (2 milyar kombinasi) → tidak mudah ditebak
- ✅ Tidak ada data sensitif di pending invite (`user2_id` masih NULL)

---

## 🚀 Cara Memperbaiki

### Step 1: Jalankan SQL Script

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik "SQL Editor" di sidebar

3. **Jalankan Script Fix**
   - Copy paste isi file `fix-couple-invite-rls.sql`
   - Klik "Run" (atau Ctrl+Enter)
   - Tunggu sampai "Success"

### Step 2: Test Invite Code

1. **Clear existing data (opsional tapi recommended):**
   ```sql
   -- Hapus semua couple untuk fresh start
   DELETE FROM couples;
   ```

2. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

3. **Test dengan 2 user:**

   **User A:**
   - Login dengan akun A
   - Buka halaman Onboarding
   - Klik "Buat Kode Invite"
   - **Copy kode** yang muncul (misal: `ABC123`)
   - Buka console browser (F12), seharusnya ada log:
     ```
     🎫 Creating invite code: { userId: "...", invite_code: "ABC123" }
     ✅ Invite created successfully: { ... }
     ```

   **User B (browser/incognito lain):**
   - Login dengan akun B
   - Buka halaman Onboarding
   - Klik "Punya Kode Invite"
   - **Paste kode** dari User A
   - Klik "Hubungkan 💕"
   - Buka console browser, seharusnya ada log:
     ```
     🔍 joinWithCode called: { userId: "...", code: "ABC123" }
     📊 Query result: { couple: {...}, findError: null }
     ✅ Couple found: { ... }
     🔄 Updating couple with user2_id: ...
     ✅ Couple updated successfully: { ... }
     ```
   - Seharusnya redirect ke Dashboard ✅

### Step 3: Verifikasi

**Di Supabase:**
- Table Editor → `couples`
- Seharusnya ada 1 row dengan:
  - `status: 'active'`
  - `user1_id: [User A ID]`
  - `user2_id: [User B ID]`
  - `linked_at: [timestamp]`

**Di Aplikasi:**
- Kedua user bisa masuk ke Dashboard (tidak redirect ke Onboarding lagi)
- Session persist saat refresh

---

## 🔍 Debugging

Jika masih error, cek console browser untuk log:

### Expected Logs (Success):

**User A - Create Invite:**
```
🎫 Creating invite code: { userId: "xxx", invite_code: "ABC123" }
✅ Invite created successfully: { id: "...", invite_code: "ABC123", status: "pending" }
```

**User B - Join Invite:**
```
🔍 joinWithCode called: { userId: "yyy", code: "ABC123" }
📊 Query result: { couple: { id: "...", invite_code: "ABC123", ... }, findError: null }
✅ Couple found: { ... }
🔄 Updating couple with user2_id: yyy
✅ Couple updated successfully: { status: "active", ... }
```

### Error Logs:

❌ **"Couple not found" tapi kode benar:**
```
🔍 joinWithCode called: { userId: "yyy", code: "ABC123" }
📊 Query result: { couple: null, findError: {...} }
❌ Couple not found
```
**Penyebab:** RLS policy masih belum diupdate  
**Solusi:** Jalankan `fix-couple-invite-rls.sql` lagi

❌ **"Permission denied":**
```
❌ Find error: { code: "42501", message: "permission denied for table couples" }
```
**Penyebab:** RLS policy salah atau belum ada  
**Solusi:** Jalankan `fix-couple-invite-rls.sql`

---

## 🧪 Testing Checklist

- [ ] SQL script `fix-couple-invite-rls.sql` sudah dijalankan
- [ ] Policy "Anyone can view pending invites" ada di Supabase
- [ ] User A bisa buat kode invite
- [ ] Kode invite muncul di UI
- [ ] User B bisa lihat form input kode
- [ ] User B bisa input kode dari User A
- [ ] User B bisa klik "Hubungkan" tanpa error
- [ ] User B redirect ke Dashboard setelah berhasil
- [ ] User A refresh → masuk ke Dashboard (bukan Onboarding)
- [ ] Di tabel `couples`, status jadi `active`
- [ ] Console browser tidak ada error merah

---

## 📊 Verifikasi RLS Policy

Untuk memastikan policy sudah benar, jalankan di SQL Editor:

```sql
-- Lihat semua policies untuk tabel couples
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'couples'
ORDER BY policyname;
```

**Expected output:**
| policyname | cmd | qual |
|------------|-----|------|
| Anyone can view pending invites | SELECT | (status = 'pending'::text) |
| Owner can manage couple | ALL | (auth.uid() = user1_id) |
| Partner can manage couple | ALL | (auth.uid() = user2_id) |
| User can join pending invite | UPDATE | (...) |

---

## 🔒 Catatan Keamanan

### Q: Apakah aman mengizinkan semua orang melihat pending invites?

**A: Ya, aman karena:**

1. **Hanya metadata yang terlihat:**
   - Pending invite tidak berisi data sensitif
   - `user2_id` masih NULL (belum ada pasangan)
   - Tidak ada transaksi atau data keuangan

2. **Invite code random:**
   - 6 karakter uppercase alphanumeric
   - 36^6 = 2,176,782,336 kombinasi
   - Sangat sulit ditebak brute force

3. **Status berubah setelah join:**
   - Setelah di-join, status → `active`
   - Active couple tidak visible via policy ini
   - Hanya owner (user1 & user2) yang bisa akses

4. **Rate limiting di aplikasi:**
   - Supabase sudah ada rate limiting built-in
   - Brute force akan kena rate limit

### Improvement untuk Production (Opsional):

**Tambah expiry time untuk invite code:**
```sql
-- Tambah kolom
ALTER TABLE couples ADD COLUMN expires_at TIMESTAMPTZ;

-- Set default: 7 hari dari created_at
UPDATE couples 
SET expires_at = created_at + INTERVAL '7 days' 
WHERE status = 'pending' AND expires_at IS NULL;

-- Update policy
DROP POLICY "Anyone can view pending invites" ON couples;
CREATE POLICY "Anyone can view valid pending invites"
  ON couples FOR SELECT
  USING (
    status = 'pending' 
    AND (expires_at IS NULL OR expires_at > NOW())
  );
```

**Tambah validasi di kode:**
```javascript
// Di inviteCouple.js
export async function joinWithCode(userId, code) {
  const { data: couple, error } = await supabase
    .from('couples')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .eq('status', 'pending')
    .single()
  
  if (!couple) throw new Error('Kode tidak ditemukan atau sudah dipakai.')
  
  // Check expiry
  if (couple.expires_at && new Date(couple.expires_at) < new Date()) {
    throw new Error('Kode invite sudah kadaluarsa.')
  }
  
  // ... rest of the code
}
```

---

## ✅ Summary

**Masalah:** RLS policy terlalu ketat → User B tidak bisa query invite User A  
**Solusi:** Tambah policy "Anyone can view pending invites"  
**File:** `fix-couple-invite-rls.sql`  
**Status:** ✅ Ready to fix

Jalankan script SQL dan test ulang invite flow!

---

**Need help?** Jika masih ada masalah:
1. Share screenshot console browser (dengan log emoji)
2. Share hasil query dari `debug-invite-code.sql`
3. Share error message lengkap
