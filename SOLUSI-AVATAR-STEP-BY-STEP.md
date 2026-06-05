# 🎯 SOLUSI AVATAR - Step by Step dengan Gambar

> Panduan visual untuk fix avatar upload - 5 MENIT SELESAI!

---

## 🚨 MASALAHNYA APA?

Upload foto avatar gagal karena **Storage Bucket belum di-setup** di Supabase.

---

## ✅ SOLUSI LENGKAP (PILIH SALAH SATU)

Ada 2 cara:
- **CARA 1: Via Dashboard** ← PALING MUDAH! (REKOMENDASI)
- **CARA 2: Via SQL** ← Untuk yang suka coding

---

# 🎨 CARA 1: Via Dashboard (TERMUDAH)

## Step 1: Buka Supabase Dashboard

1. Buka browser
2. Pergi ke: https://supabase.com/dashboard
3. Login dengan akun Supabase Anda
4. Pilih project **fintrack-couple** (atau nama project Anda)

---

## Step 2: Buka Storage

1. Di sidebar KIRI, cari **"Storage"**
2. Klik **Storage**
3. Anda akan lihat halaman "Buckets"

**APA YANG ANDA LIHAT?**

### ✅ Jika ADA bucket "avatars":
- Lanjut ke **Step 3**

### ❌ Jika TIDAK ADA bucket "avatars":
- Lanjut ke **Step 2.1: Buat Bucket**

---

## Step 2.1: Buat Bucket "avatars"

**Hanya jika bucket belum ada!**

1. Di halaman Storage, klik tombol **"New bucket"** (atau "Create bucket")
2. Isi form:
   - **Name:** `avatars` (huruf kecil semua, no space)
   - **Public bucket:** **✅ CENTANG INI!** (SUPER PENTING!)
   - File size limit: biarkan default (atau 5MB)
3. Klik **"Create bucket"** / **"Save"**

**✅ Bucket "avatars" sekarang ada!**

---

## Step 3: Cek Bucket Public

**Pastikan bucket public!**

1. Di halaman Storage, klik bucket **"avatars"**
2. Klik tab **"Configuration"** atau **"Settings"** (di atas)
3. Cek bagian **"Public bucket"**:
   - Harus **✅ CHECKED / ON**
   - Jika tidak, centang → Save

**✅ Bucket sekarang public!**

---

## Step 4: Set RLS Policies

**PENTING! Tanpa ini upload tetap gagal!**

### Cara Cepat via Dashboard:

1. Masih di bucket "avatars"
2. Cari tab **"Policies"** (atau "RLS Policies")
3. Klik **"New policy"** atau **"Add policy"**

**Buat 3 policies ini:**

### Policy 1: Allow Upload (INSERT)

```
Name: Allow authenticated upload to own folder
Target roles: authenticated
Policy type: INSERT (atau "Create")
Policy definition: Use SQL
```

**SQL:**
```sql
(
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
```

Click **Save**

---

### Policy 2: Allow Update

```
Name: Allow authenticated update own files
Target roles: authenticated
Policy type: UPDATE
Policy definition: Use SQL
```

**USING clause:**
```sql
(
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
```

Click **Save**

---

### Policy 3: Allow Public Read (SELECT)

```
Name: Public read access
Target roles: public (atau anon + authenticated)
Policy type: SELECT (atau "Read")
Policy definition: Use SQL
```

**USING clause:**
```sql
bucket_id = 'avatars'
```

Click **Save**

---

**✅ Selesai! Upload sekarang harusnya jalan!**

---

# 💻 CARA 2: Via SQL (LEBIH CEPAT)

**Untuk yang lebih suka copy-paste SQL!**

## Step 1: Buka SQL Editor

1. Supabase Dashboard → Project Anda
2. Di sidebar kiri, klik **"SQL Editor"**
3. Klik **"New query"**

---

## Step 2: Copy-Paste SQL Ini

**COPY SEMUA, paste ke SQL Editor:**

```sql
-- ========================================
-- CREATE BUCKET "avatars" (jika belum ada)
-- ========================================

-- Insert bucket (akan skip jika sudah ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- ========================================
-- SET RLS POLICIES
-- ========================================

-- Drop old policies jika ada (untuk re-run)
DROP POLICY IF EXISTS "Allow authenticated upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update own files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete own files" ON storage.objects;

-- Policy 1: INSERT (upload)
CREATE POLICY "Allow authenticated upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: UPDATE (overwrite)
CREATE POLICY "Allow authenticated update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: SELECT (read)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 4: DELETE (optional, untuk hapus foto lama)
CREATE POLICY "Allow authenticated delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Step 3: Run!

1. Klik tombol **"Run"** (atau Ctrl+Enter)
2. Tunggu sampai selesai
3. Lihat hasilnya:
   - **Success** → ✅ Semua OK!
   - **Error** → Baca error message, biasanya policy sudah ada (itu OK)

---

**✅ Selesai! Bucket & policies sudah siap!**

---

# 🧪 TEST HASILNYA

## Test 1: Via Aplikasi

1. Buka aplikasi FinTrack
2. Login
3. Pergi ke halaman **Profilku** (Settings)
4. Klik icon **Camera** di foto profil
5. Pilih foto
6. Crop → Klik **✓** (Simpan)

**LIHAT HASILNYA:**

### ✅ BERHASIL:
```
Console (F12):
📸 Starting avatar upload...
📤 Uploading to path: USER_ID/avatar.jpg
✅ Upload success
🔗 Public URL: https://...
✅ Profile updated with avatar URL
✅ Avatar upload complete!

Alert:
✅ Foto profil berhasil diupdate!

UI:
Foto baru langsung muncul!
```

### ❌ MASIH GAGAL:
```
Alert:
❌ Gagal upload foto: [error message]

Console (F12):
❌ Upload error: ...
```

**Jika masih gagal:**
- Jalankan **DIAGNOSE-AVATAR.md** (script di console)
- Atau screenshot error → tanya lagi

---

## Test 2: Via Supabase Dashboard

**Quick test untuk pastikan bucket works:**

1. Supabase Dashboard → Storage → Bucket "avatars"
2. Klik "Upload file"
3. Pilih foto random
4. Upload
5. **Apakah berhasil?**
   - ✅ Ya → Bucket OK, mungkin policy masih kurang
   - ❌ Tidak → Ada masalah di bucket config

---

# 📊 CHECKLIST

Centang semua ini:

- [ ] Bucket "avatars" sudah dibuat
- [ ] Bucket public = ✅ CHECKED
- [ ] RLS policies sudah di-set (3-4 policies)
- [ ] Test upload via Dashboard berhasil
- [ ] Test upload via aplikasi berhasil
- [ ] Console menunjukkan emoji ✅
- [ ] Alert "✅ Foto profil berhasil diupdate!"
- [ ] Foto muncul di UI
- [ ] Foto persist setelah refresh

---

# 🎯 RINGKASAN CEPAT

| Masalah | Solusi |
|---------|--------|
| Bucket tidak ada | Buat bucket "avatars" (public) |
| Bucket private | Settings → Public bucket: ✅ |
| RLS error | Set 3 policies (via Dashboard atau SQL) |
| Foto tidak muncul | Hard refresh (Ctrl+Shift+R) |
| Masih gagal | Jalankan DIAGNOSE-AVATAR.md |

---

# 🆘 BUTUH BANTUAN?

**Jika masih stuck, share ini:**

1. **Screenshot Supabase Storage:**
   - Storage → Buckets (list buckets)
   - Bucket "avatars" → Configuration tab

2. **Console log saat upload:**
   - F12 → Console tab
   - Screenshot semua log dari 📸 sampai ❌

3. **Error alert:**
   - Screenshot popup error

4. **Hasil diagnostic:**
   - Jalankan DIAGNOSE-AVATAR.md
   - Screenshot hasilnya

---

**Selamat mencoba! 🚀**

Kalau masih ada masalah, tinggal screenshot aja error-nya dan tanya lagi! 😊
