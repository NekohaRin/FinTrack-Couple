# 🔧 Penyelesaian Masalah Login

## 📋 Ringkasan Masalah

User sudah membuat akun tapi tidak bisa login ke aplikasi FinTrack Couple.

## 🎯 Solusi yang Sudah Saya Buat

Saya telah melakukan beberapa perbaikan pada kode dan menyediakan script SQL untuk memperbaiki database:

### 1. ✅ Perbaikan Kode Aplikasi

**File yang sudah diupdate:**

- ✅ `src/pages/Login.jsx` - Ditambahkan logging dan error handling yang lebih baik
- ✅ `src/hooks/useAuth.js` - Ditambahkan console log untuk debugging
- ✅ `src/features/auth/AuthGuard.jsx` - Ditambahkan fallback untuk membuat profile otomatis
- ✅ `src/lib/debugAuth.js` - Script baru untuk debugging autentikasi
- ✅ `src/lib/createProfileIfMissing.js` - Helper untuk membuat profile jika trigger DB gagal

**Fitur debugging baru:**
- Setiap kali buka halaman login, script akan otomatis cek status autentikasi
- Console browser akan menampilkan informasi lengkap tentang session, profile, dan couple
- AuthGuard sekarang punya fallback untuk membuat profile jika belum ada

### 2. ✅ Script SQL untuk Database

**File yang sudah dibuat:**

- ✅ `fix-auth-setup.sql` - Script lengkap untuk setup database
- ✅ `check-auth-status.sql` - Script untuk diagnostic
- ✅ `TROUBLESHOOTING-LOGIN.md` - Dokumentasi lengkap troubleshooting

## 🚀 Langkah-langkah Penyelesaian

### Step 1: Setup Database (PENTING!)

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com
   - Pilih project `lohxljgheytbyjbkynav`

2. **Jalankan Script Diagnostic**
   - Klik SQL Editor di sidebar
   - Copy paste isi file `check-auth-status.sql`
   - Klik Run
   - **Perhatikan hasilnya**, khususnya:
     - Apakah ada "Users without profile"?
     - Apakah trigger "on_auth_user_created" ada?
     - Apakah RLS enabled untuk semua table?

3. **Jalankan Script Fix**
   - Di SQL Editor yang sama
   - Copy paste isi file `fix-auth-setup.sql`
   - Klik Run
   - Tunggu sampai muncul "Success, no rows returned"

4. **Disable Email Confirmation (untuk development)**
   - Pergi ke: Authentication → Settings
   - Cari "Email Auth Provider"
   - **Matikan** "Enable email confirmations"
   - Klik Save

### Step 2: Test Login

1. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

2. **Buka browser console**
   - Tekan F12
   - Pilih tab Console

3. **Buka halaman login**
   - Pergi ke http://localhost:5173/login
   - Perhatikan log di console yang diawali dengan 🔍

4. **Coba login dengan akun yang sudah ada**
   - Masukkan email & password
   - Klik Masuk
   - Perhatikan log di console:
     ```
     🔐 Mencoba login dengan: user@example.com
     ✅ Login berhasil: { userId, email, session }
     ✅ User sudah login, redirect...
     ```

5. **Atau buat akun baru**
   - Pilih tab "Daftar"
   - Masukkan email & password baru
   - Klik Buat Akun
   - Karena email confirmation sudah dimatikan, seharusnya langsung bisa login

### Step 3: Verifikasi Semuanya Bekerja

Setelah login berhasil, di console browser harus muncul:

```
✅ Session saat ini: Ada
✅ Profile ditemukan: { id: "...", display_name: "...", ... }
⚠️ Couple: Belum terhubung (ini normal untuk user baru)
```

Jika muncul seperti ini, berarti login sudah berhasil! ✅

### Step 4: Testing Flow Lengkap

1. **Logout** - Di halaman Settings atau clear localStorage:
   ```javascript
   // Di browser console
   localStorage.clear()
   location.reload()
   ```

2. **Buat 2 akun berbeda** (untuk test fitur couple):
   - User A: `user1@test.com` / `password123`
   - User B: `user2@test.com` / `password123`

3. **User A: Buat kode invite**
   - Login sebagai User A
   - Setelah login, akan redirect ke onboarding
   - Klik "Buat Kode Baru"
   - Copy kode yang muncul (contoh: `ABC123`)

4. **User B: Join dengan kode**
   - Logout dari User A
   - Login sebagai User B
   - Akan redirect ke onboarding
   - Pilih "Punya Kode"
   - Masukkan kode dari User A
   - Klik "Sambungkan"

5. **Verifikasi couple berhasil**
   - Kedua user seharusnya sekarang bisa masuk ke Dashboard
   - AuthGuard tidak redirect ke onboarding lagi

## 🔍 Jika Masih Ada Masalah

### Masalah: Login gagal dengan error "Invalid login credentials"

**Kemungkinan penyebab:**
1. Password salah
2. Email belum diconfirm (padahal seharusnya sudah dimatikan)

**Solusi:**
```sql
-- Cek status user di Supabase SQL Editor
SELECT email, email_confirmed_at, encrypted_password 
FROM auth.users 
WHERE email = 'EMAIL_YANG_BERMASALAH';

-- Jika email_confirmed_at = NULL, confirm manual:
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'EMAIL_YANG_BERMASALAH';
```

### Masalah: Login berhasil tapi langsung redirect ke login lagi

**Kemungkinan penyebab:**
- Profile tidak ada
- RLS policy terlalu ketat

**Solusi:**
1. Lihat console browser, cari error merah
2. Jalankan script `check-auth-status.sql` lagi
3. Pastikan user tersebut ada di tabel `profiles`

### Masalah: Loading terus-menerus

**Kemungkinan penyebab:**
- useCouple query gagal karena RLS
- Network issue ke Supabase

**Solusi:**
1. Cek Network tab di browser (F12 → Network)
2. Cari request ke Supabase yang failed (merah)
3. Klik request tersebut, lihat Response
4. Biasanya ada pesan error dari Supabase

## 📊 Monitoring & Debugging

### Console Logs yang Normal

Ketika berhasil login, Anda akan melihat log seperti ini:

```
🔍 Debug Autentikasi Supabase
  1️⃣ Konfigurasi Supabase:
    URL: https://lohxljgheytbyjbkynav.supabase.co
    Anon Key (20 char): eyJhbGciOiJIUzI1NiI...
  
  2️⃣ Session saat ini:
    Session: ✅ Ada
    User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    Email: user@example.com
  
  3️⃣ Profile di database:
    ✅ Profile ditemukan: { id, user_id, display_name, ... }
  
  4️⃣ Couple status:
    Couple: ⚠️ Belum terhubung
```

### Console Logs yang Menandakan Masalah

❌ **Error: Profile tidak ditemukan**
```
3️⃣ Profile di database:
  ❌ Error cek profile: ...
  💡 Kemungkinan: Profile belum dibuat otomatis
```
**Solusi:** Jalankan `fix-auth-setup.sql`

❌ **Error: Permission denied**
```
❌ Error cek profile: new row violates row-level security policy
```
**Solusi:** RLS policy bermasalah, jalankan `fix-auth-setup.sql`

## 📝 Checklist Penyelesaian

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan:

- [ ] `check-auth-status.sql` sudah dijalankan di Supabase SQL Editor
- [ ] `fix-auth-setup.sql` sudah dijalankan di Supabase SQL Editor
- [ ] Email confirmation sudah dimatikan di Supabase Settings
- [ ] Aplikasi sudah dijalankan dengan `npm run dev`
- [ ] Browser console terbuka (F12)
- [ ] Bisa login dengan akun lama atau buat akun baru
- [ ] Console menampilkan ✅ untuk Session dan Profile
- [ ] Redirect ke onboarding setelah login (untuk user baru)
- [ ] Bisa buat kode invite dan join couple
- [ ] Redirect ke Dashboard setelah couple terhubung

## 🎉 Selesai!

Jika semua checklist di atas sudah centang, masalah login seharusnya sudah teratasi.

Fitur yang sekarang berfungsi:
- ✅ Sign up akun baru
- ✅ Login dengan email & password
- ✅ Profile otomatis dibuat saat sign up
- ✅ Session persist saat refresh
- ✅ AuthGuard routing bekerja
- ✅ Onboarding flow (buat/join couple)
- ✅ Redirect ke Dashboard setelah punya couple

## 🔮 Langkah Selanjutnya

Setelah login berfungsi, Anda bisa lanjut ke:
1. Sambungkan Dashboard ke data real (bukan mock)
2. Implementasi Add Transaction
3. Implementasi Partner View realtime
4. Dan seterusnya sesuai roadmap di `project.md`

---

**Need help?** Jika masih ada masalah setelah mengikuti semua langkah ini, share:
1. Screenshot console browser
2. Error message yang muncul
3. Output dari `check-auth-status.sql`
