# ⚡ Quick Fix: Avatar Upload

> Profile tidak bisa update setelah crop? Fix dalam 2 menit!

---

## 🎯 Root Cause

Bucket `avatars` belum dibuat di Supabase Storage.

---

## ✅ Fix (2 Menit)

### Step 1: Buat Bucket

1. Buka **Supabase Dashboard** → **Storage**
2. Klik **"New bucket"**
3. Setting:
   ```
   Bucket name: avatars
   Public bucket: ✅ YES (CHECK THIS!)
   ```
4. Klik **"Create"**

### Step 2: Set Policies

1. Klik bucket **"avatars"**
2. Tab **"Policies"**
3. Klik **"New Policy"** → **"For full customization"**
4. Copy paste policy ini:

**Policy Name:** `Users can upload own avatar`

**Target roles:** `authenticated`

**Allowed operations:** SELECT `INSERT`, `UPDATE`, `DELETE`

**USING expression:**
```sql
(bucket_id = 'avatars'::text) AND 
((storage.foldername(name))[1] = (auth.uid())::text)
```

5. Klik **"Review"** → **"Save policy"**

### Step 3: Test

1. **Buka aplikasi** → Settings
2. **Click foto profil** → Pilih foto
3. **Crop** → Klik "Simpan ✨"
4. **Cek console** (F12):
   ```
   ✅ Upload success
   ✅ Profile updated
   ```
5. **Foto update!** 🎉

---

## 🔍 Debug

**Jika masih error, cek console:**

- ❌ `Bucket not found` → Bucket belum dibuat (Step 1)
- ❌ `RLS policy` → Policy belum di-set (Step 2)
- ✅ `Upload success` → Berhasil!

---

## 📖 Detail Lengkap

Lihat: `SETUP-AVATAR-UPLOAD.md`

---

**Done!** 🚀 Avatar upload sekarang berfungsi!
