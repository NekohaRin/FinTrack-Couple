# 🖼️ Setup Avatar Upload

> Panduan lengkap untuk setup upload foto profil dengan Supabase Storage

---

## 🎯 Problem

Profile tidak bisa update setelah crop karena:
1. Bucket `avatars` belum dibuat di Supabase Storage
2. RLS policies belum di-setup

---

## ✅ Solusi Step-by-Step

### Step 1: Buat Bucket di Supabase Dashboard (EASY WAY ✨)

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com
   - Pilih project Anda

2. **Buka Storage**
   - Klik "Storage" di sidebar kiri
   - Klik "New bucket" atau "Create bucket"

3. **Konfigurasi Bucket**
   ```
   Bucket name: avatars
   Public bucket: ✅ YES (CHECKED)
   File size limit: 5 MB (optional)
   Allowed MIME types: image/* (optional)
   ```

4. **Klik "Create bucket"**
   - Bucket siap digunakan!
   - Policies otomatis dibuat untuk public read

5. **Set Upload Policies (IMPORTANT!)**
   - Klik bucket "avatars"
   - Tab "Policies"
   - Klik "New Policy"
   - **Policy 1: User dapat upload avatar sendiri**
     ```
     Policy name: Users can upload own avatar
     Target roles: authenticated
     Operation: INSERT
     Policy definition:
     (bucket_id = 'avatars'::text) AND 
     ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
   - **Policy 2: User dapat update avatar sendiri**
     ```
     Policy name: Users can update own avatar
     Target roles: authenticated
     Operation: UPDATE
     Policy definition:
     (bucket_id = 'avatars'::text) AND 
     ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
   - **Policy 3: User dapat delete avatar sendiri**
     ```
     Policy name: Users can delete own avatar
     Target roles: authenticated
     Operation: DELETE
     Policy definition:
     (bucket_id = 'avatars'::text) AND 
     ((storage.foldername(name))[1] = (auth.uid())::text)
     ```

---

### Step 2: Verifikasi Setup

**Di Supabase Dashboard:**
1. Storage → avatars
2. Coba manual upload file (untuk test)
3. File harus muncul di list
4. Bisa di-download/view

**Via SQL Editor:**
```sql
-- Cek bucket ada
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Expected result:
-- id: avatars
-- public: true
```

---

### Step 3: Test Upload di Aplikasi

1. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

2. **Buka Settings**
   - Login
   - Buka Settings (tab Profil)

3. **Upload foto**
   - Click foto profil (icon camera)
   - Pilih foto dari device
   - Crop foto
   - Click "Simpan ✨"

4. **Cek console browser (F12)**
   ```
   📸 Starting avatar upload: { fileName, fileSize, ... }
   📤 Uploading to path: USER_ID/avatar.jpg
   ✅ Upload success: { ... }
   🔗 Public URL: https://...supabase.co/storage/v1/object/public/avatars/USER_ID/avatar.jpg
   ✅ Profile updated with avatar URL: { ... }
   ✅ Avatar upload complete!
   ```

5. **Verifikasi di UI**
   - Foto profil harus update otomatis
   - Refresh halaman → foto masih ada
   - Foto juga muncul di Dashboard & Tabungan

---

## 🔍 Debugging

### Error: "Bucket not found"

**Console log:**
```
❌ Upload error: { message: "Bucket not found" }
```

**Solusi:**
- Pastikan bucket `avatars` sudah dibuat
- Cek typo di nama bucket (harus exact: `avatars`)

---

### Error: "new row violates row-level security policy"

**Console log:**
```
❌ Upload error: { message: "new row violates row-level security policy" }
```

**Solusi:**
- Upload policies belum di-set
- Ikuti Step 1 nomor 5 di atas
- Atau jalankan `setup-storage-bucket.sql` (tapi Dashboard lebih mudah)

---

### Error: "The resource already exists"

**Console log:**
```
❌ Upload error: { message: "The resource already exists" }
```

**Ini BUKAN error!** File sudah ada dan akan di-overwrite karena `upsert: true`.
Jika tetap error, coba hapus file lama dulu:

```javascript
// Delete file lama
await supabase.storage
  .from('avatars')
  .remove([`${userId}/avatar.jpg`])

// Upload lagi
await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file)
```

---

### Foto tidak update di UI

**Problem:** Upload success tapi UI tidak update

**Solusi:**
1. Cek console → apakah `✅ Profile updated` muncul?
2. Refresh halaman (Ctrl+R)
3. Clear cache browser
4. Cek di Supabase:
   ```sql
   SELECT avatar_url FROM profiles WHERE user_id = 'USER_ID';
   ```

---

### Foto broken/tidak muncul

**Problem:** URL tersimpan tapi foto tidak load

**Solusi:**
1. Cek URL di database:
   ```sql
   SELECT avatar_url FROM profiles;
   ```
2. Copy URL → paste di browser baru
3. Jika 404 → file tidak ada di storage
4. Jika 403 → bucket bukan public atau policy salah
5. Fix:
   - Storage → avatars → Configuration
   - Public bucket: ✅ YES
   - Save

---

## 📊 File Structure di Storage

```
avatars/
├── USER_ID_1/
│   └── avatar.jpg    (atau .png, .webp, etc)
├── USER_ID_2/
│   └── avatar.png
└── USER_ID_3/
    └── avatar.jpg
```

**Benefits:**
- ✅ Setiap user punya folder sendiri
- ✅ RLS policy bisa enforce: user hanya akses folder sendiri
- ✅ File bisa di-overwrite dengan upsert
- ✅ Tidak ada naming conflict

---

## 🔒 Security Notes

### RLS Policies Explained:

**1. Public Read:**
```sql
-- Semua orang bisa lihat avatar (termasuk unauthenticated)
bucket_id = 'avatars'
```

**2. User Upload:**
```sql
-- User hanya bisa upload ke folder sendiri
bucket_id = 'avatars' AND 
(storage.foldername(name))[1] = auth.uid()::text

-- Contoh:
-- User ID: abc-123
-- Allowed: avatars/abc-123/avatar.jpg ✅
-- Blocked:  avatars/def-456/avatar.jpg ❌
```

**3. Update & Delete:**
- Same logic dengan upload
- User hanya bisa modify file di folder sendiri

---

## 💡 Tips

### Optimize Image Size

Di `AvatarCropSheet.tsx`, output file sudah di-compress:
```javascript
canvas.toBlob(
  (blob) => { ... },
  'image/jpeg',
  0.9  // Quality 90% = smaller file size
)
```

### Support Multiple Formats

Hook sudah support semua format:
```javascript
const ext = file.name.split('.').pop()  // jpg, png, webp, etc
const path = `${user.id}/avatar.${ext}`
```

### Cache Busting

Jika foto tidak update setelah upload, tambahkan timestamp:
```javascript
const path = `${user.id}/avatar.${ext}?t=${Date.now()}`
```

---

## ✅ Checklist Setup

- [ ] Bucket `avatars` sudah dibuat
- [ ] Public bucket: YES
- [ ] Upload policies sudah di-set (INSERT, UPDATE, DELETE)
- [ ] Test manual upload via Dashboard → success
- [ ] Test upload via aplikasi → success
- [ ] Console log menampilkan `✅ Upload success`
- [ ] Foto muncul di UI
- [ ] Foto persist setelah refresh
- [ ] Foto muncul di semua halaman (Dashboard, Settings, Tabungan)

---

## 🚀 Advanced: Pre-signed URLs (Optional)

Jika ingin private avatars (tidak public):

```javascript
// Get signed URL (expires in 1 hour)
const { data, error } = await supabase.storage
  .from('avatars')
  .createSignedUrl(`${userId}/avatar.jpg`, 3600)

const signedUrl = data.signedUrl
```

**Use case:** Private photos, temporary access, etc.

---

## 📚 Resources

- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **RLS for Storage:** https://supabase.com/docs/guides/storage/security/access-control
- **Image Upload Guide:** https://supabase.com/docs/guides/storage/uploads

---

## 🎉 Summary

**Setup:**
1. Buat bucket `avatars` (public)
2. Set upload policies
3. Test upload

**Code:**
- Hook `useUploadAvatar` sudah siap
- Crop & upload sudah integrated
- Auto invalidate queries untuk refresh UI

**Result:**
- ✅ User bisa upload & crop foto
- ✅ Foto auto-save ke database
- ✅ UI auto-update
- ✅ Foto persist & visible everywhere

---

**Status:** 🟢 Ready to use after bucket setup!
