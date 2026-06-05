# ✅ Checklist: Memperbaiki Masalah Login

Print atau bookmark halaman ini dan centang setiap langkah yang sudah selesai.

---

## 🎯 Persiapan

- [ ] Buka Supabase Dashboard (https://supabase.com)
- [ ] Login dan pilih project `lohxljgheytbyjbkynav`
- [ ] Buka 2 tab browser: satu untuk Supabase, satu untuk aplikasi
- [ ] Buka file `fix-auth-setup.sql` dan `check-auth-status.sql` di code editor

---

## 📊 Step 1: Diagnostic (Opsional tapi Recommended)

- [ ] Buka Supabase → SQL Editor
- [ ] Copy paste isi file `check-auth-status.sql`
- [ ] Klik Run
- [ ] Catat hasil:
  - [ ] Berapa total users? _______
  - [ ] Berapa total profiles? _______
  - [ ] Apakah ada "Users without profile"? ⬜ Ya / ⬜ Tidak
  - [ ] Apakah trigger "on_auth_user_created" ada? ⬜ Ya / ⬜ Tidak
  - [ ] Apakah semua tabel RLS enabled? ⬜ Ya / ⬜ Tidak

**Jika ada yang Tidak, lanjut ke Step 2!**

---

## 🔧 Step 2: Fix Database

- [ ] Di Supabase SQL Editor yang sama
- [ ] Copy paste isi file `fix-auth-setup.sql`
- [ ] Klik Run (atau Ctrl+Enter)
- [ ] Tunggu sampai muncul "Success, no rows returned" atau "Success"
- [ ] Refresh halaman Supabase

### Verifikasi:
- [ ] Jalankan `check-auth-status.sql` lagi
- [ ] Sekarang trigger "on_auth_user_created" harus ada ✅
- [ ] Semua tabel RLS harus enabled ✅
- [ ] Tidak ada lagi "Users without profile" ✅

---

## 📧 Step 3: Disable Email Confirmation

- [ ] Di Supabase Dashboard, klik "Authentication" di sidebar
- [ ] Klik "Settings" (tab di bagian atas)
- [ ] Scroll ke section "Email Auth Provider"
- [ ] Cari toggle "Enable email confirmations"
- [ ] **Matikan** toggle tersebut (harus OFF/abu-abu)
- [ ] Klik "Save" di bagian bawah

### Verifikasi:
- [ ] Toggle "Enable email confirmations" berwarna abu-abu (OFF)
- [ ] Muncul notifikasi "Successfully updated settings" atau sejenis

---

## 💻 Step 4: Test di Aplikasi

### Persiapan:
- [ ] Buka terminal di folder project
- [ ] Jalankan `npm run dev`
- [ ] Tunggu sampai muncul "Local: http://localhost:5173"
- [ ] Buka browser, tekan F12 untuk console
- [ ] Buka http://localhost:5173/login

### Cek Debug Log:
- [ ] Di console browser, harus muncul log dengan icon 🔍
- [ ] Log menampilkan "Konfigurasi Supabase" dengan URL dan Key
- [ ] Tidak ada error merah di console (pada tahap ini)

### Test Akun Baru:
- [ ] Klik tab "Daftar"
- [ ] Masukkan email baru: `test1@example.com`
- [ ] Masukkan password: `password123`
- [ ] Klik "Buat Akun"
- [ ] Perhatikan console:
  - [ ] Muncul log "📝 Mencoba registrasi dengan..."
  - [ ] Muncul log "✅ signUp success"
  - [ ] Muncul log "✅ Profile created successfully" (setelah 1 detik)
  - [ ] **TIDAK ADA** error merah di console
- [ ] Setelah beberapa detik, otomatis redirect ke halaman Onboarding ✅

### Test Login dengan Akun Lama (jika ada):
- [ ] Logout atau buka incognito window baru
- [ ] Buka http://localhost:5173/login
- [ ] Klik tab "Masuk"
- [ ] Masukkan email akun lama
- [ ] Masukkan password
- [ ] Klik "Masuk"
- [ ] Perhatikan console:
  - [ ] Muncul log "🔐 Mencoba login dengan..."
  - [ ] Muncul log "✅ Login berhasil"
  - [ ] Muncul log "✅ User sudah login, redirect..."
- [ ] Redirect ke Onboarding atau Dashboard (tergantung status couple)

### Test Session Persist:
- [ ] Setelah login berhasil dan ada di dashboard/onboarding
- [ ] Tekan F5 atau Ctrl+R untuk refresh halaman
- [ ] **TIDAK** kembali ke halaman login ✅
- [ ] Session masih ada, tetap di halaman yang sama ✅

---

## 🤝 Step 5: Test Couple Flow (Opsional)

### User A - Buat Kode Invite:
- [ ] Login sebagai User A (atau buat akun baru)
- [ ] Di halaman Onboarding, klik "Buat Kode Baru"
- [ ] Muncul kode 6 karakter (contoh: ABC123)
- [ ] **Copy kode ini**: _______________

### User B - Join dengan Kode:
- [ ] Buka incognito window atau browser lain
- [ ] Buka http://localhost:5173/login
- [ ] Buat akun baru atau login sebagai User B
- [ ] Di halaman Onboarding, klik "Punya Kode"
- [ ] Paste kode dari User A
- [ ] Klik "Sambungkan"
- [ ] Muncul notifikasi success
- [ ] Redirect ke Dashboard ✅

### Verifikasi Couple Berhasil:
- [ ] User A: Refresh halaman → sekarang masuk ke Dashboard (bukan Onboarding)
- [ ] User B: Sudah di Dashboard
- [ ] Kedua user tidak redirect ke Onboarding lagi
- [ ] Di Supabase → Table Editor → `couples`:
  - [ ] Ada record baru dengan status "active"
  - [ ] `user1_id` dan `user2_id` terisi
  - [ ] `linked_at` ada timestamp

---

## ✅ Final Check

### Console Browser (saat sudah login):
```
✅ Harus ada:
   - 🔍 Debug Autentikasi Supabase
   - ✅ Session saat ini: Ada
   - ✅ Profile ditemukan
   - User ID & Email terisi

❌ TIDAK boleh ada:
   - Error merah yang mention "profile"
   - Error "permission denied"
   - Error "Invalid login credentials" (kecuali password memang salah)
```

### Aplikasi:
- [ ] Bisa sign up akun baru
- [ ] Bisa login dengan akun yang sudah ada
- [ ] Setelah login, redirect ke Onboarding (user baru) atau Dashboard (user dengan couple)
- [ ] Tidak logout saat refresh halaman
- [ ] Tidak stuck di loading screen

### Database (cek di Supabase):
- [ ] Tabel `auth.users` dan `profiles` jumlah recordnya sama
- [ ] Semua user di `auth.users` ada di `profiles`
- [ ] Trigger `on_auth_user_created` ada di database
- [ ] Semua tabel punya RLS enabled

---

## 🎉 Selesai!

Jika semua checklist di atas sudah ✅, masalah login sudah teratasi!

### Yang Sekarang Berfungsi:
- ✅ Sign up akun baru
- ✅ Login dengan email & password  
- ✅ Profile otomatis dibuat saat sign up
- ✅ Session persist saat refresh
- ✅ AuthGuard routing
- ✅ Onboarding flow (buat/join couple)
- ✅ Redirect ke Dashboard setelah couple terhubung

### Langkah Selanjutnya:
1. Sambungkan Dashboard ke data real (ganti mock data)
2. Implement Add Transaction
3. Implement Partner View realtime
4. Fix Google OAuth
5. Deploy ke production

Lihat roadmap lengkap di `project.md`.

---

## 🆘 Troubleshooting

Jika ada yang tidak centang:

| Masalah | Lihat Dokumen |
|---------|---------------|
| Diagnostic menunjukkan masalah | `TROUBLESHOOTING-LOGIN.md` |
| Error di console browser | `FIX-LOGIN-ISSUE.md` section "Jika Masih Ada Masalah" |
| Login gagal | `QUICK-START.md` section "Troubleshooting Cepat" |
| Pertanyaan umum | `TROUBLESHOOTING-LOGIN.md` |

---

**Happy coding! 🚀**

*Checklist ini dibuat untuk memastikan semua langkah perbaikan dijalankan dengan benar.*
