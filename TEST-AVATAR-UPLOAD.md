# 🧪 Test Avatar Upload

> Manual testing guide untuk debug avatar upload issue

---

## 🔍 Diagnostic Steps

### Step 1: Cek Bucket Exists

**Via Supabase Dashboard:**
1. Login ke Supabase Dashboard
2. Storage → Buckets
3. **Apakah ada bucket bernama `avatars`?**
   - ✅ Ada → Lanjut ke Step 2
   - ❌ Tidak ada → **BUAT DULU!** (lihat QUICK-FIX-AVATAR.md)

### Step 2: Cek Bucket Public

1. Klik bucket `avatars`
2. Settings/Configuration tab
3. **Public bucket: harus ✅ CHECKED**
   - ✅ Checked → OK
   - ❌ Unchecked → Check ini, lalu Save

### Step 3: Test Upload Manual

**Via Dashboard:**
1. Bucket `avatars` → klik
2. Click "Upload file"
3. Pilih foto test (JPG/PNG)
4. Upload
5. **Apakah berhasil?**
   - ✅ Berhasil → Bucket OK, masalah di policies
   - ❌ Gagal → Bucket ada masalah

### Step 4: Test Via Browser Console

**Buka aplikasi, login, lalu buka Console (F12):**

```javascript
// Test 1: Cek apakah bisa akses storage
const testBasic = await supabase.storage.from('avatars').list()
console.log('Test basic:', testBasic)
// Expected: { data: [], error: null } atau { data: [...files], error: null }

// Test 2: Cek user ID
const { data: { user } } = await supabase.auth.getUser()
console.log('User ID:', user.id)

// Test 3: Create test blob
const blob = new Blob(['test'], { type: 'text/plain' })
const file = new File([blob], 'test.txt', { type: 'text/plain' })

// Test 4: Try upload
const result = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/test.txt`, file, { upsert: true })
  
console.log('Upload result:', result)

// Expected success:
// { data: { path: "USER_ID/test.txt", ... }, error: null }

// Expected error:
// { data: null, error: { message: "..." } }
```

### Step 5: Analyze Error

**Error 1: "Bucket not found"**
```
{ error: { message: "Bucket not found" } }
```
**Fix:** Bucket `avatars` belum dibuat

---

**Error 2: "new row violates row-level security policy"**
```
{ error: { message: "new row violates row-level security policy" } }
```
**Fix:** RLS policies belum di-set. 

**Quick fix via SQL:**
```sql
-- Run di Supabase SQL Editor:
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');
```

---

**Error 3: "403 Forbidden"**
```
{ error: { message: "Forbidden" } }
```
**Fix:** Bucket tidak public atau policies salah

---

**Error 4: "The resource already exists"**
```
{ error: { message: "The resource already exists" } }
```
**This is OK!** File already exists. Karena pakai `upsert: true`, seharusnya tetap berhasil.

Jika masih error, delete file lama dulu:
```javascript
await supabase.storage
  .from('avatars')
  .remove([`${user.id}/test.txt`])
```

---

## 🔧 Manual Fix for RLS Policies

**Jika policies tidak bisa dibuat via Dashboard, gunakan SQL:**

```sql
-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read public bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Authenticated users can upload to own folder
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Authenticated users can update own files
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Authenticated users can delete own files
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📊 Expected Flow

1. **User pilih foto** → `handleFileChange` called
2. **Foto muncul di crop** → `AvatarCropSheet` shown
3. **User crop & klik Simpan** → `handleCropDone` called
4. **Console log:**
   ```
   🔄 Memulai upload avatar...
   📸 Starting avatar upload: { fileName, fileSize, ... }
   📤 Uploading to path: USER_ID/avatar.jpg
   ✅ Upload success: { ... }
   🔗 Public URL: https://...
   ✅ Profile updated with avatar URL: { ... }
   ✅ Avatar upload complete!
   ```
5. **Alert:** "✅ Foto profil berhasil diupdate!"
6. **UI update:** Foto baru muncul

---

## 🚨 Common Issues

### Issue 1: Console log stops at "Starting avatar upload"

**Symptom:**
```
📸 Starting avatar upload: { ... }
(no more logs)
```

**Cause:** Upload failed before reaching next log

**Debug:**
```javascript
// Add this to useUploadAvatar in useProfile.js:
console.log('Step 1: Creating path...')
const path = `${user.id}/avatar.${ext}`
console.log('Step 2: Path created:', path)

console.log('Step 3: Attempting upload...')
const { data, error } = await supabase.storage...
console.log('Step 4: Upload result:', { data, error })
```

---

### Issue 2: Upload success tapi foto tidak muncul

**Symptom:**
```
✅ Upload success
✅ Profile updated
(tapi UI tidak update)
```

**Debug:**
1. Refresh halaman (Ctrl+R)
2. Cek database:
   ```sql
   SELECT avatar_url FROM profiles WHERE user_id = 'YOUR_USER_ID';
   ```
3. Copy URL dari database → paste di browser baru
4. Jika 404 → file tidak ada
5. Jika muncul → cache issue, hard refresh (Ctrl+Shift+R)

---

### Issue 3: Alert error tapi console tidak ada detail

**Symptom:**
```
❌ Gagal upload foto: Unknown error
```

**Fix:** Check hook `useUploadAvatar` - pastikan semua error di-catch dan di-log

---

## ✅ Success Checklist

Test semua ini harus pass:

- [ ] Bucket `avatars` exists
- [ ] Bucket is public
- [ ] Can upload file manually via Dashboard
- [ ] Browser console test upload success
- [ ] Can upload via aplikasi
- [ ] Console shows all success logs
- [ ] Alert "✅ Foto profil berhasil diupdate!"
- [ ] Foto appears in UI immediately
- [ ] Foto persists after refresh
- [ ] Foto shows on all pages (Dashboard, Tabungan)

---

## 📞 If Still Not Working

Share these info:

1. **Error from alert:** Copy paste exact error message
2. **Console logs:** Copy all logs from console
3. **Bucket status:** Screenshot of Storage → avatars → Settings
4. **Test upload result:** Result dari browser console test
5. **Database check:**
   ```sql
   SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';
   ```

---

**Good luck! 🚀**
