# FinTrack Couple — Status & Progress Project

> Dokumentasi perkembangan project per 5 Juni 2026

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

### Tabungan (menu baru — gabungan)
- Tab "Tabungan Berdua" → nabung bareng dengan progress & riwayat
- Kedua pengguna bisa input kontribusi
- Notifikasi realtime saat pasangan nabung (belum diimplementasi)

### Wishlist Bersama
- Daftar impian bersama dengan kategori custom
- Target harga & progress tabungan per item
- Link produk & Google Maps per item
- Halaman detail wishlist dengan riwayat tabungan

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
│   ├── App.jsx                         ✅ Root component
│   ├── Router.jsx                      ✅ Semua route terdaftar
│   └── QueryProvider.jsx               ✅ React Query provider
│
├── pages/
│   ├── Login.jsx                       ✅ Email + Google auth
│   ├── Onboarding.tsx                  ✅ Buat & join invite code
│   ├── Dashboard.tsx                   ✅ UI lengkap (mock data)
│   ├── PartnerView.tsx                 ✅ UI lengkap (mock data)
│   ├── Tabungan.tsx                    ✅ UI lengkap (mock data)
│   ├── Wishlist.tsx                    ✅ UI lengkap + kategori tab
│   ├── WishlistDetail.tsx              ✅ Detail + link produk + maps
│   ├── Settings.tsx                    ✅ UI lengkap + foto profil
│   ├── SettingsNotifications.tsx       ✅ Toggle notifikasi
│   ├── SettingsPrivacy.tsx             ✅ Privasi & keamanan
│   └── SettingsHelp.tsx                ✅ FAQ accordion
│
├── features/
│   └── auth/
│       ├── AuthGuard.jsx               ✅ Cek login + cek couple
│       └── inviteCouple.js             ✅ Tersambung Supabase
│
├── components/
│   ├── BottomNav.tsx                   ✅ 5 tab navigasi
│   ├── AvatarPhoto.tsx                 ✅ Foto profil dengan fallback inisial
│   ├── TransactionItem.tsx             ✅ Item transaksi + format tanggal
│   ├── AddTransactionSheet.tsx         ✅ Bottom sheet input transaksi
│   ├── AddSavingSheet.tsx              ✅ Bottom sheet input tabungan
│   ├── AddWishlistSheet.tsx            ✅ Bottom sheet tambah impian
│   ├── AddCategorySheet.tsx            ✅ Bottom sheet tambah kategori
│   └── Decor.tsx                       ✅ FloatingDecor + Blobs
│
├── hooks/
│   ├── useAuth.js                      ✅ Login, logout, session
│   ├── useCouple.js                    ✅ Tersambung Supabase
│   └── useProfile.js                   ✅ Tersambung Supabase
│
└── lib/
    ├── supabase.js                     ✅ Client terkonfigurasi
    ├── queryClient.js                  ✅ React Query config
    ├── mock.ts                         ⚠️  Data dummy — belum diganti
    ├── formatCurrency.js               ✅ Format Rupiah
    └── formatDate.js                   ✅ Format tanggal + formatTxDate
```

---

## Status Fitur

### Auth & Onboarding
| Fitur | Status | Catatan |
|---|---|---|
| Daftar akun email | ✅ | Jalan |
| Login email | ✅ | Jalan |
| Login Google | ⚠️ | Redirect URI perlu fix di Google Console |
| Email verification | ✅ | Dimatikan untuk development |
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
| Tabungan Berdua | ✅ | ⚠️ | Masih mock data |
| Wishlist | ✅ | ⚠️ | Masih mock data |
| Wishlist Detail | ✅ | ⚠️ | Link produk & maps sudah UI |
| Settings | ✅ | ⚠️ | Foto profil, tema, dark mode (UI only) |
| Settings → Notifikasi | ✅ | ⚠️ | Toggle UI only |
| Settings → Privasi | ✅ | ⚠️ | UI only |
| Settings → Bantuan | ✅ | ⚠️ | FAQ static |

### Komponen
| Komponen | Status | Catatan |
|---|---|---|
| BottomNav 5 tab | ✅ | Beranda, Pasangan, Tabungan, Impian, Profil |
| AvatarPhoto | ✅ | Foto / fallback inisial |
| TransactionItem | ✅ | Format tanggal otomatis |
| AddTransactionSheet | ✅ | UI lengkap |
| AddSavingSheet | ✅ | UI lengkap |
| AddWishlistSheet | ✅ | UI + link produk & maps |
| AddCategorySheet | ✅ | UI lengkap |

### Format Tanggal
| Kondisi | Format |
|---|---|
| Hari ini | "Hari ini" |
| Kemarin | "Kemarin" |
| 2-3 hari lalu | "2 hari lalu" / "3 hari lalu" |
| Lebih dari 3 hari | "Senin, 2 Jun 2026" |

---

## Yang Belum Dikerjakan

### Prioritas Tinggi — Koneksi Supabase
- [ ] **Sambungkan Dashboard** → fetch transaksi & saldo dari Supabase
- [ ] **Add Transaction** → simpan ke tabel `transactions`
- [ ] **Sambungkan Partner View** → baca transaksi pasangan realtime
- [ ] **Sambungkan Tabungan** → CRUD tabel baru `savings`
- [ ] **Sambungkan Wishlist** → CRUD tabel `wishlist_items`
- [ ] **Sambungkan Wishlist Detail** → tabungan per item
- [ ] **Sambungkan Settings** → update profile, foto, tema dari Supabase

### Prioritas Sedang
- [ ] **Tema warna** → simpan ke `profiles.theme_color`, apply ke seluruh app
- [ ] **Ganti foto profil** → upload ke Supabase Storage
- [ ] **Realtime notifikasi** → subscribe ke transaksi baru pasangan
- [ ] **Budget per kategori** → input & tracking budget bulanan
- [ ] **Fix Google OAuth** → selesaikan redirect URI di Google Console
- [ ] **Kustomisasi kategori** → tambah/edit/hapus kategori dari DB

### Prioritas Rendah
- [ ] **Deploy ke Vercel** → setup PWA manifest + HTTPS
- [ ] **Install ke homescreen** → test di Android & iOS
- [ ] **Push notification** → notif saat pasangan input transaksi
- [ ] **Laporan bulanan** → ringkasan pengeluaran per bulan
- [ ] **Export data** → download laporan sebagai PDF/CSV
- [ ] **Dark mode** → implementasi penuh

---

## Masalah yang Ada

| Masalah | Status | Solusi |
|---|---|---|
| Login Google error `redirect_uri_mismatch` | 🔴 Belum fix | Perbaiki Authorized redirect URI di Google Console |
| Tema warna belum persist | 🟡 UI only | Sambungkan ke `profiles.theme_color` di Supabase |
| Semua data masih mock | 🟡 In progress | Akan disambungkan ke Supabase satu per satu |
| Tabel `savings` belum ada | 🔴 Perlu dibuat | Buat tabel baru di Supabase untuk tabungan berdua |

---

## Tabel Baru yang Perlu Dibuat

### `savings` — untuk fitur Tabungan Berdua
```sql
CREATE TABLE savings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  added_by uuid REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount decimal(15,2) NOT NULL,
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "savings_couple" ON savings
  USING (
    couple_id IN (
      SELECT id FROM couples
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );
```

---

## Langkah Selanjutnya

```
1. Buat tabel savings di Supabase
2. Sambungkan Dashboard → fetch transaksi dari Supabase
3. Sambungkan Add Transaction → simpan ke DB
4. Sambungkan Partner View → realtime
5. Sambungkan Tabungan → savings table
6. Sambungkan Wishlist → wishlist_items table
7. Sambungkan Settings → profile + foto + tema
8. Fix Google OAuth
9. Deploy ke Vercel
10. Test install PWA di Android & iOS
```

---

*Dokumentasi ini di-update per sesi development. Selalu update setelah ada perubahan signifikan.*