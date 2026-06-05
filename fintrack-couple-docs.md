# FinTrack Couple — Dokumentasi Sistem

> Aplikasi pengatur keuangan untuk pasangan berbasis PWA (Progressive Web App).  
> Dibangun dengan React + Vite + Supabase. Target: 2 pengguna (pasangan/couple).

---

## 1. Gambaran Umum

### Apa itu PWA?
Progressive Web App adalah website biasa yang berperilaku seperti aplikasi native di smartphone. Pengguna cukup membuka link sekali di browser, lalu install ke homescreen — tanpa perlu App Store atau Play Store.

**Keunggulan untuk proyek ini:**
- Satu codebase jalan di Android & iOS
- Install ke homescreen = akses 1 tap seperti app native
- Update otomatis tanpa perlu update manual
- Tidak perlu biaya developer account ($99/tahun Apple, dll)
- Session login panjang, tidak perlu login ulang setiap buka

---

## 2. Konsep Keuangan: 3 Ruang

### Ruang Pribadi
- Catatan pemasukan & pengeluaran masing-masing
- Budget bulanan per kategori
- Kategori bisa dikustomisasi (nama, ikon, warna)
- Laporan ringkasan bulanan

### Ruang Bersama (Shared Wallet)
- Kas bersama untuk pengeluaran patungan
- Ringkasan pengeluaran gabungan
- Notifikasi realtime saat pasangan input transaksi

### Wishlist Bersama
- Daftar impian bersama (liburan, barang, dll)
- Target harga & progress tabungan
- Sistem vote prioritas

### Transparansi Data
- Semua transaksi pribadi **otomatis terlihat** oleh pasangan (read-only)
- Pasangan tidak bisa edit/hapus catatan milik satu sama lain
- Setiap pengguna punya dashboard sendiri untuk mengelola catatannya
- Persetujuan transparansi dikonfirmasi saat pertama kali link akun (`visibility_consent`)

---

## 3. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | React + Vite | Familiar, fast build |
| UI | Tailwind CSS + shadcn/ui | Mobile-first, komponen siap pakai |
| Backend / DB | Supabase (PostgreSQL) | Realtime sync, auth built-in, gratis |
| Auth | Supabase Auth | Login Google / email, session persisten |
| Hosting | Vercel | Free tier, HTTPS otomatis, PWA-ready |
| PWA | Vite PWA Plugin | Service worker + manifest otomatis |

### Kenapa Supabase?
- **Database relasional (PostgreSQL)** — cocok untuk relasi data transaksi, budget, kategori
- **Auth siap pakai** — login Google/email tanpa coding dari nol
- **Realtime sync** — notifikasi instan saat pasangan input transaksi baru
- **Row Level Security (RLS)** — keamanan akses data di level database
- **Free tier cukup** — 500MB DB, 50k auth users, 200 realtime connections

---

## 4. Skema Database

### Tabel: `profiles`
Data akun & preferensi tiap pengguna.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Primary key |
| user_id | uuid FK | Referensi ke Supabase Auth |
| display_name | string | Nama tampilan / nickname |
| avatar_url | string | URL foto profil |
| theme_color | string | Warna tema pilihan user |
| dashboard_layout | jsonb | Urutan & konfigurasi widget dashboard |
| created_at | timestamp | Waktu dibuat |

### Tabel: `couples`
Menghubungkan dua akun sebagai pasangan.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Primary key |
| user1_id | uuid FK | Akun pertama |
| user2_id | uuid FK | Akun kedua |
| status | string | `pending` / `active` |
| visibility_consent | boolean | Persetujuan transparansi data |
| linked_at | timestamp | Waktu terhubung |

### Tabel: `categories`
Kategori pengeluaran yang bisa dikustomisasi per pengguna.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Primary key |
| owner_id | uuid FK | Pemilik kategori |
| name | string | Nama kategori (misal: Makan, Transport) |
| icon | string | Nama ikon |
| color | string | Warna kategori |
| scope | string | `personal` / `shared` |
| created_at | timestamp | Waktu dibuat |

### Tabel: `transactions`
Catatan pemasukan & pengeluaran pribadi.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Primary key |
| user_id | uuid FK | Pemilik transaksi |
| category_id | uuid FK | Kategori transaksi |
| amount | decimal | Nominal |
| type | string | `income` / `expense` |
| note | string | Catatan opsional |
| date | date | Tanggal transaksi |
| created_at | timestamp | Waktu dibuat |

> Tidak ada field `scope` — semua transaksi otomatis terlihat pasangan via RLS.

### Tabel: `budgets`
Batas pengeluaran per kategori per pengguna.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Primary key |
| user_id | uuid FK | Pemilik budget |
| category_id | uuid FK | Kategori yang dibudget |
| amount | decimal | Batas nominal |
| period | string | `monthly` / `weekly` |
| start_date | date | Awal periode |

### Tabel: `shared_wallet`
Kas bersama pasangan.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Primary key |
| couple_id | uuid FK | Referensi ke pasangan |
| added_by | uuid FK | Siapa yang input |
| category_id | uuid FK | Kategori transaksi |
| amount | decimal | Nominal |
| type | string | `income` / `expense` |
| note | string | Catatan opsional |
| date | date | Tanggal transaksi |
| created_at | timestamp | Waktu dibuat |

### Tabel: `wishlist_items`
Daftar impian bersama.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Primary key |
| couple_id | uuid FK | Referensi ke pasangan |
| added_by | uuid FK | Siapa yang tambah |
| title | string | Nama item impian |
| target_price | decimal | Target harga |
| saved_amount | decimal | Sudah terkumpul |
| priority_votes | int | Jumlah vote prioritas |
| status | string | `active` / `achieved` |
| created_at | timestamp | Waktu dibuat |

---

## 5. Row Level Security (RLS)

```sql
-- Transaksi: pemilik bisa CRUD
CREATE POLICY "owner_crud" ON transactions
  USING (user_id = auth.uid());

-- Transaksi: pasangan bisa READ saja
CREATE POLICY "partner_read" ON transactions
  FOR SELECT USING (
    user_id IN (
      SELECT CASE
        WHEN user1_id = auth.uid() THEN user2_id
        ELSE user1_id
      END
      FROM couples
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
        AND status = 'active'
        AND visibility_consent = true
    )
  );

-- Shared wallet: hanya pasangan yang terhubung
CREATE POLICY "couple_access" ON shared_wallet
  USING (
    couple_id IN (
      SELECT id FROM couples
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Wishlist: hanya pasangan yang terhubung
CREATE POLICY "couple_access" ON wishlist_items
  USING (
    couple_id IN (
      SELECT id FROM couples
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );
```

---

## 6. Struktur Folder Project

```
fintrack/
└── src/
    ├── app/
    │   ├── App.jsx
    │   ├── Router.jsx
    │   └── QueryProvider.jsx
    │
    ├── pages/
    │   ├── Dashboard.jsx         # tampilan pribadi
    │   ├── PartnerView.jsx       # lihat catatan pasangan (read-only)
    │   ├── SharedWallet.jsx      # kas bersama
    │   ├── Wishlist.jsx          # wishlist bersama
    │   ├── Login.jsx
    │   ├── Onboarding.jsx        # flow invite pasangan
    │   └── Settings.jsx
    │
    ├── features/
    │   ├── auth/
    │   │   ├── useAuth.js
    │   │   ├── AuthGuard.jsx
    │   │   └── inviteCouple.js
    │   │
    │   ├── transactions/
    │   │   ├── TransactionList.jsx
    │   │   ├── TransactionForm.jsx
    │   │   ├── useTransactions.js
    │   │   └── transactionService.js
    │   │
    │   ├── budget/
    │   │   ├── BudgetCard.jsx
    │   │   ├── BudgetForm.jsx
    │   │   └── useBudgets.js
    │   │
    │   ├── categories/
    │   │   ├── CategoryManager.jsx
    │   │   └── useCategories.js
    │   │
    │   ├── partner/
    │   │   ├── PartnerSummary.jsx
    │   │   ├── PartnerTransactions.jsx
    │   │   ├── usePartner.js
    │   │   └── useRealtimePartner.js   # subscribe realtime transaksi pasangan
    │   │
    │   ├── shared-wallet/
    │   │   ├── WalletSummary.jsx
    │   │   ├── WalletForm.jsx
    │   │   └── useSharedWallet.js
    │   │
    │   ├── wishlist/
    │   │   ├── WishlistCard.jsx
    │   │   ├── WishlistForm.jsx
    │   │   └── useWishlist.js
    │   │
    │   └── dashboard/
    │       ├── WidgetGrid.jsx          # drag-and-drop widget
    │       └── useDashboardLayout.js
    │
    ├── components/                     # komponen UI reusable
    │   ├── BottomNav.jsx
    │   ├── AmountInput.jsx
    │   ├── CategoryPicker.jsx
    │   ├── NotificationBadge.jsx
    │   └── EmptyState.jsx
    │
    ├── lib/                            # utilitas & config
    │   ├── supabase.js                 # Supabase client (satu titik config)
    │   ├── queryClient.js
    │   ├── formatCurrency.js
    │   └── formatDate.js
    │
    ├── hooks/                          # global hooks
    │   ├── useCouple.js
    │   ├── useProfile.js
    │   └── useNotifications.js
    │
    └── styles/
        ├── index.css
        └── theme.css

index.html
vite.config.js
tailwind.config.js
.env.local
```

---

## 7. Kustomisasi UI

- **Dashboard layout** — urutan widget bisa diatur drag-and-drop, disimpan di `profiles.dashboard_layout` (JSON)
- **Tema warna** — setiap pengguna bisa pilih warna tema sendiri, disimpan di `profiles.theme_color`
- **Kategori** — nama, ikon, dan warna bisa dikustomisasi bebas per pengguna
- **Nickname pasangan** — bisa diatur di Settings

---

## 8. Rencana Pengembangan

| Minggu | Fokus | Detail |
|---|---|---|
| 1–2 | Fondasi & auth | Setup project, login Google/email, flow invite pasangan, struktur DB + RLS |
| 3 | Catatan pribadi | Input transaksi, kategori, budget bulanan, laporan ringkas |
| 4 | Fitur bersama | Shared wallet, tampilan catatan pasangan (read-only), notifikasi realtime |
| 5 | Wishlist & kustomisasi | Wishlist bersama, drag widget, tema warna, polish UX |
| 6 | Deploy & install | Vercel deploy, PWA manifest, testing di Android & iOS |

---

## 9. Perintah Setup Awal

```bash
# Buat project
npm create vite@latest fintrack -- --template react
cd fintrack

# Install dependencies utama
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install react-router-dom
npm install tailwindcss @tailwindcss/vite
npm install @dnd-kit/core @dnd-kit/sortable   # drag-and-drop widget

# Install shadcn/ui
npx shadcn@latest init

# PWA plugin
npm install -D vite-plugin-pwa
```

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

*Dokumen ini mencakup semua keputusan arsitektur yang telah direncanakan. Update sesuai perkembangan development.*
