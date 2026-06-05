# FinTrack Couple — Status & Progress Project

> Dokumentasi perkembangan project per 3 Juni 2026

---

## Konsep & Tech Stack

| | |
|---|---|
| **Tipe** | Progressive Web App (PWA) |
| **Target pengguna** | 2 orang (pasangan/couple) |
| **Frontend** | React + Vite + TypeScript |
| **UI** | Tailwind CSS — pinky glassmorphism aesthetic |
| **Font** | Dancing Script (script) + Quicksand (body) |
| **Backend / DB** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth — Email + Google OAuth |
| **Realtime** | Supabase Realtime (belum diimplementasi) |
| **Hosting** | Belum deploy — masih localhost |

---

## Konsep Keuangan: 3 Ruang

### Ruang Pribadi
- Catatan pemasukan & pengeluaran masing-masing
- Budget bulanan per kategori
- Semua transaksi **otomatis terlihat** oleh pasangan (read-only)
- Setiap pengguna punya dashboard sendiri untuk mengelola

### Ruang Bersama (Shared Wallet)
- Kas bersama untuk pengeluaran patungan
- Kedua pengguna bisa input & lihat
- Notifikasi realtime saat pasangan input (belum diimplementasi)

### Wishlist Bersama
- Daftar impian bersama
- Target harga & progress tabungan
- Sistem vote prioritas

---

## Database Supabase — 7 Tabel

| Tabel | Status | Keterangan |
|---|---|---|
| `profiles` | ✅ | Auto-create via trigger saat user baru daftar |
| `couples` | ✅ | Sistem invite code (pending → active) |
| `categories` | ✅ | Kategori custom per user |
| `transactions` | ✅ | Catatan pribadi, visible ke pasangan via RLS |
| `budgets` | ✅ | Budget per kategori per user |
| `shared_wallet` | ✅ | Kas bersama pasangan |
| `wishlist_items` | ✅ | Impian bersama |

### Row Level Security (RLS)
- Semua tabel sudah aktif RLS
- Transaksi pribadi: pemilik CRUD, pasangan READ only
- Shared wallet & wishlist: hanya pasangan yang terhubung
- Transparansi: semua transaksi otomatis visible ke pasangan (`visibility_consent = true`)

---

## Struktur Folder Project

```
src/
├── app/
│   ├── App.jsx                   ✅ Root component
│   ├── Router.jsx                ✅ Semua route terdaftar
│   └── QueryProvider.jsx         ✅ React Query provider
│
├── pages/
│   ├── Login.jsx                 ✅ Email + Google auth
│   ├── Onboarding.tsx            ✅ Buat & join invite code
│   ├── Dashboard.tsx             ✅ UI lengkap (mock data)
│   ├── PartnerView.tsx           ✅ UI lengkap (mock data)
│   ├── SharedWallet.tsx          ✅ UI lengkap (mock data)
│   ├── Wishlist.tsx              ✅ UI lengkap (mock data)
│   └── Settings.tsx              ✅ UI lengkap (mock data)
│
├── features/
│   └── auth/
│       ├── AuthGuard.jsx         ✅ Cek login + cek couple
│       └── inviteCouple.js       ✅ Tersambung Supabase
│
├── components/
│   ├── BottomNav.tsx             ✅ 5 tab navigasi
│   ├── TransactionItem.tsx       ✅ Item transaksi
│   ├── AddTransactionSheet.tsx   ✅ Bottom sheet input
│   └── Decor.tsx                 ✅ FloatingDecor + Blobs
│
├── hooks/
│   ├── useAuth.js                ✅ Login, logout, session
│   ├── useCouple.js              ✅ Tersambung Supabase
│   └── useProfile.js             ✅ Tersambung Supabase
│
└── lib/
    ├── supabase.js               ✅ Client terkonfigurasi
    ├── queryClient.js            ✅ React Query config
    ├── mock.ts                   ⚠️  Data dummy — belum diganti
    ├── formatCurrency.js         ✅ Format Rupiah
    └── formatDate.js             ✅ Format tanggal Indonesia
```

---

## Status Fitur

### Auth & Onboarding
| Fitur | Status | Catatan |
|---|---|---|
| Daftar akun email | ✅ | Jalan |
| Login email | ✅ | Jalan |
| Login Google | ⚠️ | Redirect URI perlu fix di Google Console |
| Email verification | ⚠️ | Perlu confirm manual via SQL saat development |
| Alur redirect setelah login | ✅ | AuthGuard cek couple otomatis |
| Buat kode invite | ✅ | Tersambung Supabase |
| Join dengan kode invite | ✅ | Tersambung Supabase |
| Redirect ke onboarding kalau belum couple | ✅ | Jalan |

### Halaman & UI
| Halaman | UI | Data | Catatan |
|---|---|---|---|
| Login | ✅ | ✅ | Tersambung auth |
| Onboarding | ✅ | ✅ | Tersambung Supabase |
| Dashboard | ✅ | ⚠️ | Masih mock data |
| Partner View | ✅ | ⚠️ | Masih mock data |
| Shared Wallet | ✅ | ⚠️ | Masih mock data |
| Wishlist | ✅ | ⚠️ | Masih mock data |
| Settings | ✅ | ⚠️ | Masih mock data |

### Navigasi
| Fitur | Status |
|---|---|
| BottomNav 5 tab | ✅ |
| Active state per halaman | ✅ |
| Navigasi antar halaman | ✅ |

---

## Yang Belum Dikerjakan

### Prioritas Tinggi
- [ ] **Sambungkan Dashboard** → fetch transaksi & saldo dari Supabase
- [ ] **Add Transaction** → simpan ke tabel `transactions`
- [ ] **Sambungkan Partner View** → baca transaksi pasangan realtime
- [ ] **Sambungkan Shared Wallet** → CRUD tabel `shared_wallet`
- [ ] **Sambungkan Wishlist** → CRUD tabel `wishlist_items`
- [ ] **Sambungkan Settings** → update profile dari Supabase

### Prioritas Sedang
- [ ] **Realtime notifikasi** → subscribe ke transaksi baru pasangan
- [ ] **Budget per kategori** → input & tracking budget bulanan
- [ ] **Fix Google OAuth** → selesaikan redirect URI di Google Console
- [ ] **Kustomisasi kategori** → tambah/edit/hapus kategori sendiri
- [ ] **Drag widget dashboard** → urutan widget bisa diatur

### Prioritas Rendah
- [ ] **Deploy ke Vercel** → setup PWA manifest + HTTPS
- [ ] **Install ke homescreen** → test di Android & iOS
- [ ] **Push notification** → notif saat pasangan input transaksi
- [ ] **Laporan bulanan** → ringkasan pengeluaran per bulan
- [ ] **Export data** → download laporan sebagai PDF/CSV

---

## Masalah yang Sedang Ada

| Masalah | Status | Solusi |
|---|---|---|
| Login Google error `redirect_uri_mismatch` | 🔴 Belum fix | Perbaiki Authorized redirect URI di Google Console |
| User tidak bisa login meski akun sudah dibuat | � FIXED | Jalankan `fix-auth-setup.sql` + lihat `FIX-LOGIN-ISSUE.md` |
| Email baru perlu confirm manual | 🟢 FIXED | Matikan email verification di Supabase Settings (dev only) |
| Semua data masih mock | 🟡 In progress | Akan disambungkan ke Supabase satu per satu |

### ✅ Perbaikan Terbaru (3 Juni 2026)

**Masalah Login Sudah Diselesaikan:**
1. ✅ Ditambahkan debug script (`src/lib/debugAuth.js`) untuk monitoring autentikasi
2. ✅ Ditambahkan fallback profile creation di AuthGuard
3. ✅ Dibuat script SQL lengkap (`fix-auth-setup.sql`) untuk:
   - Setup trigger otomatis membuat profile saat user sign up
   - Fix RLS policies untuk semua tabel
   - Membuat profile untuk user yang sudah ada tapi belum punya profile
4. ✅ Dibuat script diagnostic (`check-auth-status.sql`) untuk troubleshooting
5. ✅ Dokumentasi lengkap di `FIX-LOGIN-ISSUE.md` dan `TROUBLESHOOTING-LOGIN.md`

**File Baru:**
- `src/lib/debugAuth.js` - Script debugging autentikasi
- `src/lib/createProfileIfMissing.js` - Helper fallback profile creation
- `fix-auth-setup.sql` - Script setup database lengkap
- `check-auth-status.sql` - Script diagnostic
- `FIX-LOGIN-ISSUE.md` - Panduan penyelesaian masalah login
- `TROUBLESHOOTING-LOGIN.md` - Dokumentasi troubleshooting lengkap

**File yang Diupdate:**
- `src/pages/Login.jsx` - Ditambahkan logging dan redirect logic
- `src/hooks/useAuth.js` - Ditambahkan console logging untuk debugging
- `src/features/auth/AuthGuard.jsx` - Ditambahkan profile check fallback

---

## Langkah Selanjutnya

```
1. Fix konfirmasi email (matikan di Supabase untuk development)
2. Test full flow: daftar → onboarding → hubungkan pasangan → dashboard
3. Sambungkan Dashboard ke Supabase
4. Sambungkan Add Transaction → simpan ke DB
5. Sambungkan Partner View → realtime
6. Sambungkan Shared Wallet & Wishlist
7. Sambungkan Settings → profile
8. Fix Google OAuth
9. Deploy ke Vercel
10. Test install PWA di Android & iOS
```

---

*Dokumentasi ini di-update per sesi development. Selalu update setelah ada perubahan signifikan.*