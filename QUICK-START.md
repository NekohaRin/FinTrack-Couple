# 🚀 Quick Start - Memperbaiki Masalah Login

> **TL;DR:** Akun sudah dibuat tapi tidak bisa login? Ikuti 3 langkah ini.

---

## ⚡ 3 Langkah Cepat

### 1️⃣ Fix Database (5 menit)

**A. Buka Supabase Dashboard:**
- Login ke https://supabase.com
- Pilih project: `lohxljgheytbyjbkynav`
- Klik **SQL Editor** di sidebar

**B. Jalankan script ini:**
1. Buka file `fix-auth-setup.sql` di project ini
2. Copy seluruh isinya
3. Paste di SQL Editor
4. Klik **Run** (atau tekan Ctrl+Enter)
5. Tunggu sampai muncul "Success"

### 2️⃣ Matikan Email Confirmation (1 menit)

Di Supabase Dashboard yang sama:
1. Klik **Authentication** di sidebar
2. Klik **Settings** (bukan Providers)
3. Scroll ke "Email Auth Provider"
4. **Matikan** toggle "Enable email confirmations"
5. Klik **Save**

### 3️⃣ Test Login (2 menit)

```bash
# Jalankan aplikasi
npm run dev
```

1. Buka http://localhost:5173/login
2. Tekan **F12** untuk buka Console
3. **Buat akun baru** atau **login** dengan akun lama
4. Lihat console browser:
   - ✅ Jika muncul "Login berhasil" → Selesai!
   - ❌ Jika ada error merah → Lanjut ke troubleshooting di bawah

---

## ✅ Selesai!

Jika berhasil, Anda akan:
- Redirect ke halaman Onboarding (untuk user baru)
- Bisa buat kode invite atau join couple
- Redirect ke Dashboard setelah couple terhubung

---

## ❌ Troubleshooting Cepat

### Masalah: "Invalid login credentials"

**Solusi:**
Di Supabase SQL Editor, jalankan:
```sql
-- Confirm email user yang bermasalah
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'EMAIL_ANDA@example.com';
```

### Masalah: Login berhasil tapi redirect ke login lagi

**Solusi:**
1. Cek console browser (F12), apakah ada error merah?
2. Jalankan diagnostic script:
   - Buka file `check-auth-status.sql`
   - Copy & paste ke Supabase SQL Editor
   - Klik Run
   - Lihat hasilnya, cari baris dengan ❌ atau ⚠️

### Masalah: Profile tidak ditemukan

**Solusi:**
Script `fix-auth-setup.sql` sudah handle ini. Tapi kalau masih error:

```sql
-- Buat profile manual untuk user tertentu
INSERT INTO profiles (user_id, display_name)
VALUES (
  'USER_ID_DARI_AUTH_USERS',
  'Nama Display'
);
```

User ID bisa dicari dengan:
```sql
SELECT id, email FROM auth.users WHERE email = 'EMAIL_ANDA@example.com';
```

---

## 📚 Dokumentasi Lengkap

Jika masih ada masalah, baca dokumentasi lengkap:

- **`FIX-LOGIN-ISSUE.md`** - Panduan step-by-step penyelesaian
- **`TROUBLESHOOTING-LOGIN.md`** - Troubleshooting detail
- **`check-auth-status.sql`** - Script diagnostic
- **`fix-auth-setup.sql`** - Script setup database

---

## 🎯 Yang Sudah Diperbaiki

1. ✅ Database trigger untuk auto-create profile
2. ✅ RLS policies untuk semua tabel
3. ✅ Fallback profile creation di kode
4. ✅ Debug logging di console browser
5. ✅ Email confirmation bisa dimatikan

---

**Butuh bantuan?** Jika semua langkah sudah diikuti tapi masih error:
1. Screenshot console browser
2. Share output dari `check-auth-status.sql`
3. Copy error message yang muncul

---

**Selamat coding! 🚀**
