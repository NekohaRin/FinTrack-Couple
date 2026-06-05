# Troubleshooting: User Tidak Bisa Login

## 🔍 Identifikasi Masalah

Berdasarkan analisis kode, ada beberapa kemungkinan penyebab user tidak bisa login meskipun akun sudah dibuat:

### Kemungkinan 1: Profile Tidak Terbuat Otomatis ✅ PALING MUNGKIN
**Gejala:**
- Akun berhasil dibuat di Supabase Auth
- Login gagal dengan error atau hang di loading
- Di console browser mungkin ada error terkait `profiles` table

**Penyebab:**
Database trigger untuk membuat profile otomatis saat user sign up belum dibuat atau tidak berjalan.

**Solusi:**
1. Buka Supabase Dashboard → SQL Editor
2. Jalankan script `fix-auth-setup.sql` yang sudah saya buat
3. Script ini akan:
   - Membuat trigger otomatis untuk user baru
   - Membuat profile untuk user yang sudah ada tapi belum punya profile
   - Setup semua RLS policies yang benar

---

### Kemungkinan 2: Email Confirmation Belum Dikonfirmasi
**Gejala:**
- User bisa sign up tapi tidak bisa login
- Error: "Email not confirmed" atau "Invalid login credentials"

**Penyebab:**
Supabase membutuhkan email verification sebelum bisa login.

**Solusi untuk Development:**

**Opsi A - Disable Email Confirmation (Cepat):**
1. Buka Supabase Dashboard
2. Authentication → Settings
3. Email Auth Provider
4. Matikan "Enable email confirmations"
5. Klik Save

**Opsi B - Confirm Manual via SQL:**
```sql
-- Lihat user yang belum confirmed
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- Confirm user tertentu
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

---

### Kemungkinan 3: RLS Policy Terlalu Ketat
**Gejala:**
- Login berhasil tapi langsung redirect ke login lagi
- Di console browser: error permission denied saat query `profiles` atau `couples`

**Penyebab:**
Row Level Security policy tidak mengizinkan user membaca datanya sendiri.

**Solusi:**
Script `fix-auth-setup.sql` sudah mencakup semua RLS policy yang benar. Jalankan script tersebut.

---

### Kemungkinan 4: Session Tidak Persist
**Gejala:**
- Bisa login sebentar lalu langsung logout
- Setiap refresh halaman harus login lagi

**Penyebab:**
Session storage tidak berfungsi dengan baik.

**Solusi:**
Cek konfigurasi di `src/lib/supabase.js` - sudah benar dengan `persistSession: true`.
Coba clear browser cache dan localStorage:
```javascript
// Di browser console
localStorage.clear()
location.reload()
```

---

## 🛠️ Langkah Debugging

### 1. Jalankan Debug Script
Script debug sudah saya tambahkan ke halaman Login. Untuk melihat hasilnya:

1. Jalankan aplikasi: `npm run dev`
2. Buka browser → buka Console (F12)
3. Buka halaman login
4. Lihat output dengan icon 🔍

Script akan menampilkan:
- ✅ Konfigurasi Supabase (URL, key)
- ✅ Session status
- ✅ Profile di database
- ✅ Couple status

### 2. Cek Database Langsung
Buka Supabase Dashboard → Table Editor:

**Cek tabel `auth.users`:**
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

**Cek tabel `profiles`:**
```sql
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;
```

**Cek apakah jumlahnya sama:**
```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles;
```

Jika `total_users` > `total_profiles`, berarti ada user yang tidak punya profile!

### 3. Cek RLS Policies
Di Supabase Dashboard → Authentication → Policies:
- Pastikan semua table punya policies
- Pastikan RLS enabled untuk semua table

### 4. Cek Browser Console Errors
Saat mencoba login, perhatikan console browser:
- Error merah = ada masalah
- Warning kuning = perlu perhatian
- Log dengan emoji = debug info dari script saya

---

## ✅ Solusi Lengkap Step-by-Step

### Step 1: Setup Database Trigger & RLS
```bash
# 1. Copy script fix-auth-setup.sql
# 2. Buka Supabase Dashboard → SQL Editor
# 3. Paste & jalankan script tersebut
# 4. Tunggu sampai selesai (muncul "Success")
```

### Step 2: Disable Email Confirmation (Development)
```bash
# Di Supabase Dashboard:
# Authentication → Settings → Email Auth Provider
# → Matikan "Enable email confirmations"
```

### Step 3: Test Login
```bash
# 1. Jalankan aplikasi
npm run dev

# 2. Buka browser console (F12)
# 3. Coba buat akun baru atau login dengan akun lama
# 4. Perhatikan log di console untuk melihat apa yang terjadi
```

### Step 4: Verify Everything Works
Setelah login berhasil, cek di console browser:
```
✅ Session saat ini: Ada
✅ User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✅ Email: user@example.com
✅ Profile ditemukan: { id, user_id, display_name, ... }
⚠️ Couple: Belum terhubung (normal untuk user baru)
```

---

## 🚨 Jika Masih Gagal

### Cek Manual di Supabase
1. Buka Supabase Dashboard
2. Authentication → Users
3. Klik user yang bermasalah
4. Lihat detailnya:
   - ✅ Email Confirmed: harus `true`
   - ✅ Last Sign In: harus ada timestamp
   - ✅ User Metadata: boleh kosong

### Hard Reset User (Last Resort)
Jika user tertentu tetap tidak bisa login:
```sql
-- 1. Hapus dari profiles
DELETE FROM profiles WHERE user_id = 'USER_ID_DARI_AUTH_USERS';

-- 2. Hapus dari auth
-- HATI-HATI: Ini akan menghapus akun permanen!
-- User harus sign up lagi
```

### Contact Me
Jika semua solusi di atas tidak berhasil, share informasi berikut:
1. Screenshot console browser saat login
2. Error message yang muncul
3. Output dari query:
```sql
SELECT COUNT(*) as users FROM auth.users;
SELECT COUNT(*) as profiles FROM profiles;
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
```

---

## 📝 Catatan untuk Production

Setelah development selesai, jangan lupa:
1. ✅ Aktifkan kembali email confirmation
2. ✅ Setup email template yang proper
3. ✅ Tambahkan redirect URL untuk email verification
4. ✅ Test full flow: sign up → verify email → login
5. ✅ Setup password reset flow
6. ✅ Remove atau matikan debug script

---

## 🎯 Checklist Debugging

Gunakan checklist ini untuk memastikan semua sudah dicek:

- [ ] Script `fix-auth-setup.sql` sudah dijalankan
- [ ] Email confirmation sudah di-disable untuk development
- [ ] User yang error sudah dicek di `auth.users` table
- [ ] Profile untuk user tersebut sudah ada di `profiles` table
- [ ] RLS policies sudah aktif dan benar
- [ ] Browser console tidak ada error merah
- [ ] Debug script menampilkan ✅ untuk semua check
- [ ] Session tersimpan di localStorage browser
- [ ] Bisa refresh halaman tanpa logout
- [ ] AuthGuard berfungsi (redirect ke onboarding jika belum couple)

---

Semoga membantu! 🚀
