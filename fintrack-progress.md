# FinTrack Couple — Status & Progress Project

> Dokumentasi perkembangan project per 6 Juni 2026

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
| **Realtime** | Supabase Realtime ✅ Aktif |
| **Push Notif** | Web Push API + Supabase Edge Function ✅ |
| **Hosting** | Vercel ✅ Deployed |
| **Offline** | IndexedDB — transaksi pribadi saja ✅ |

---

## Fitur Lengkap

### Auth & Onboarding
| Fitur | Status |
|---|---|
| Daftar akun email | ✅ |
| Login email | ✅ |
| Login Google | ⚠️ Redirect URI perlu fix |
| Invite & pairing couple | ✅ |
| Putuskan koneksi pasangan | ✅ |
| Redirect otomatis (AuthGuard) | ✅ |

### Halaman
| Halaman | Status | Data |
|---|---|---|
| Login | ✅ | ✅ Real |
| Onboarding | ✅ | ✅ Real |
| Dashboard | ✅ | ✅ Real |
| Partner View | ✅ | ✅ Real |
| Tabungan Berdua | ✅ | ✅ Real |
| Wishlist + kategori | ✅ | ✅ Real |
| Wishlist Detail | ✅ | ✅ Real |
| Settings | ✅ | ✅ Real |
| Settings → Notifikasi | ✅ | ✅ Real |
| Settings → Privasi | ✅ | ✅ Real |
| Settings → Bantuan | ✅ | Static FAQ |

### Komponen
| Komponen | Status |
|---|---|
| BottomNav 5 tab | ✅ |
| AvatarPhoto + crop | ✅ |
| TransactionItem + format tanggal | ✅ |
| AddTransactionSheet | ✅ |
| AddSavingSheet | ✅ |
| AddWishlistSheet (add + edit) | ✅ |
| AddCategorySheet | ✅ |
| NotificationToast | ✅ |

### Fitur Teknis
| Fitur | Status |
|---|---|
| Realtime sync pasangan | ✅ |
| In-app toast notification | ✅ |
| Push notification (background) | ✅ |
| Offline mode transaksi pribadi | ✅ |
| Auto sync saat online | ✅ |
| Upload & crop foto profil | ✅ |
| Ganti tema warna (persist) | ✅ |
| PWA install ke homescreen | ✅ |
| Deploy Vercel | ✅ |

---

## Struktur Database

| Tabel | Status |
|---|---|
| `profiles` | ✅ + trigger auto-create |
| `couples` | ✅ + invite system |
| `categories` | ✅ |
| `transactions` | ✅ + RLS |
| `budgets` | ✅ |
| `shared_wallet` | ✅ |
| `wishlist_items` | ✅ |
| `savings` | ✅ |
| `push_subscriptions` | ✅ |

---

## Yang Belum Dikerjakan

### Prioritas Sedang
- [ ] **Fix Google OAuth** — redirect URI di Google Console
- [ ] **Budget per kategori** — input & tracking budget bulanan
- [ ] **Laporan bulanan** — ringkasan pengeluaran per bulan
- [ ] **Dark mode** — implementasi penuh
- [ ] **Kustomisasi kategori** — tambah/edit/hapus dari DB

### Prioritas Rendah
- [ ] **Export data** — download laporan PDF/CSV
- [ ] **Scan struk** — OCR foto struk → auto isi form
- [ ] **Import CSV mutasi** — dari m-banking
- [ ] **Saving goal per wishlist** — target tabungan per item
- [ ] **Laporan grafik** — chart pengeluaran per kategori

---

## Masalah yang Ada

| Masalah | Status |
|---|---|
| Login Google `redirect_uri_mismatch` | 🔴 Belum fix |
| iOS push notif hanya Safari | ⚠️ Limitasi Apple |

---

*Dokumentasi di-update per sesi development.*
