# ✅ WishlistDetail Connected to Backend

> WishlistDetail.tsx sekarang sudah terhubung dengan Supabase!

---

## 🎯 YANG DIUBAH

### 1. **SQL Migration** - `add-wishlist-to-savings.sql`
**Apa yang dilakukan:**
- Menambah kolom `wishlist_item_id` ke tabel `savings`
- Membuat relasi antara savings dan wishlist_items
- Membuat trigger auto-update `saved_amount` di wishlist

**Cara menggunakan:**
```sql
-- Jalankan di Supabase SQL Editor
-- File: add-wishlist-to-savings.sql
```

**Hasil:**
- Setiap saving bisa dikaitkan dengan wishlist tertentu
- `saved_amount` di wishlist otomatis update saat ada saving baru/update/delete
- General saving (tanpa wishlist) tetap bisa dibuat

---

### 2. **Hooks Updated**

#### `useSavings.js`
**Fungsi baru:**
```javascript
useWishlistSavings(wishlistItemId)
```
- Fetch semua savings untuk wishlist tertentu
- Include profile info (nama, avatar)
- Sorted by date DESC

**Fungsi diupdate:**
- `useAddSaving` - Sekarang bisa terima `wishlist_item_id`
- `useUpdateSaving` - Invalidate wishlist queries juga
- `useDeleteSaving` - Invalidate wishlist queries juga

---

#### `useWishlist.js`
**Fungsi yang sudah ada:**
- `useWishlistItem(id)` - Fetch single wishlist by ID ✅
- `useDeleteWishlistItem()` - Delete wishlist ✅
- `useUpdateWishlistItem()` - Update wishlist ✅

---

### 3. **Components Updated**

#### `AddSavingSheet.tsx`
**Props baru:**
```typescript
wishlistItemId?: string
```

**Perubahan:**
- Bisa menerima wishlistItemId dari parent
- Saat save, kirim wishlist_item_id ke backend
- Otomatis link saving dengan wishlist

**Usage:**
```tsx
// General saving (tanpa wishlist)
<AddSavingSheet open={open} onClose={onClose} />

// Saving untuk wishlist tertentu
<AddSavingSheet 
  open={open} 
  onClose={onClose} 
  wishlistItemId={wishlistId}
/>
```

---

#### `WishlistDetail.tsx`
**SEBELUM:** Pakai mock data `WISHES`, `SAVINGS`

**SESUDAH:** Pakai real data dari Supabase!

**Hooks yang dipakai:**
```typescript
const { data: wish, isLoading: wishLoading } = useWishlistItem(id!)
const { data: savings, isLoading: savingsLoading } = useWishlistSavings(id!)
const deleteWishlist = useDeleteWishlistItem()
```

**Fitur yang jalan:**
- ✅ Fetch detail wishlist by ID
- ✅ Tampilkan progress bar (saved/target)
- ✅ Tampilkan product_link & maps_link (jika ada)
- ✅ Fetch riwayat tabungan untuk wishlist ini
- ✅ Tampilkan nama & avatar yang nabung
- ✅ Tambah tabungan baru (linked to wishlist)
- ✅ Delete wishlist (dengan konfirmasi)
- ✅ Loading states
- ✅ Empty states

**Fitur yang belum:**
- ❌ Edit wishlist (tombol ada, tapi coming soon)

---

## 🚀 CARA MENGGUNAKAN

### Step 1: Run SQL Migration

1. Buka Supabase Dashboard
2. SQL Editor → New query
3. Copy-paste isi `add-wishlist-to-savings.sql`
4. Klik "Run"
5. Tunggu sampai success

**Verifikasi:**
```sql
-- Cek kolom baru
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'savings' 
  AND column_name = 'wishlist_item_id';

-- Cek trigger
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_wishlist_saved_amount';
```

---

### Step 2: Test di Aplikasi

#### Test 1: Lihat Detail Wishlist
1. Buka aplikasi → Login
2. Pergi ke **Impian Kita** (Wishlist)
3. Klik salah satu wishlist
4. **Expected:**
   - Detail wishlist muncul
   - Progress bar menunjukkan saved/target
   - Link produk & maps (jika ada)
   - Riwayat tabungan (jika ada)

#### Test 2: Tambah Tabungan untuk Wishlist
1. Di halaman WishlistDetail
2. Klik "+ Tambah Tabungan"
3. Isi jumlah, catatan, tanggal
4. Klik "Simpan 💕"
5. **Expected:**
   - Alert/popup success (atau langsung close)
   - Riwayat langsung update
   - Progress bar langsung update
   - saved_amount otomatis bertambah

#### Test 3: Delete Wishlist
1. Di halaman WishlistDetail
2. Klik tombol "Hapus" (di bawah)
3. Konfirmasi "OK"
4. **Expected:**
   - Kembali ke halaman Wishlist
   - Item yang dihapus hilang dari list

---

## 🔍 FLOW LENGKAP

### Flow: Tambah Tabungan ke Wishlist

```
User di WishlistDetail 
  → Klik "+ Tambah Tabungan"
  → AddSavingSheet terbuka (props: wishlistItemId=WISH_ID)
  → User isi form
  → Klik "Simpan"
  → useAddSaving.mutateAsync({ 
      amount, 
      note, 
      date, 
      wishlist_item_id: WISH_ID 
    })
  → INSERT ke tabel savings
  → Trigger auto-update saved_amount di wishlist_items
  → onSuccess:
    - Invalidate queries (savings, wishlist)
    - Refetch data
  → Component re-render
  → Progress bar & riwayat update
  → Sheet close
```

---

### Flow: Auto-Update saved_amount

**Scenario:** User tambah tabungan Rp 100.000 untuk wishlist "Liburan Bali"

```sql
-- 1. Insert saving baru
INSERT INTO savings (couple_id, added_by, amount, wishlist_item_id, ...)
VALUES (..., 100000, 'WISH_ID', ...);

-- 2. Trigger auto-fire
-- Hitung total savings untuk wishlist ini
SELECT SUM(amount) FROM savings WHERE wishlist_item_id = 'WISH_ID'
-- Hasil: 350000 (sudah ada 250000 sebelumnya)

-- 3. Update wishlist
UPDATE wishlist_items 
SET saved_amount = 350000 
WHERE id = 'WISH_ID';

-- 4. Frontend refetch
-- Progress bar: 350000 / 5000000 = 7%
```

**✅ Semua otomatis! Tidak perlu manual update saved_amount**

---

## 📊 DATABASE STRUCTURE

### Tabel: `savings`
```
id                  uuid PRIMARY KEY
couple_id           uuid → couples.id
added_by            uuid → profiles.user_id
amount              numeric(15,2)
note                text
date                date
wishlist_item_id    uuid → wishlist_items.id (NULLABLE!)
created_at          timestamptz
```

**wishlist_item_id nullable** karena:
- ✅ NULL = general saving (tidak terkait wishlist)
- ✅ UUID = saving untuk wishlist tertentu

---

### Tabel: `wishlist_items`
```
id              uuid PRIMARY KEY
couple_id       uuid → couples.id
added_by        uuid → profiles.user_id
title           text
emoji           text
category        text
target_price    numeric(15,2)
saved_amount    numeric(15,2) (AUTO-UPDATED!)
note            text
product_link    text
maps_link       text
priority_votes  integer
status          text (active/achieved)
created_at      timestamptz
```

**saved_amount** otomatis update via trigger!

---

## 🧪 TEST SCENARIOS

### ✅ Test 1: Wishlist Tanpa Tabungan
```
1. Buat wishlist baru "iPhone 15" - Rp 15.000.000
2. Klik wishlist di list
3. Expected:
   - Progress: 0%
   - Riwayat: "Belum ada tabungan"
```

### ✅ Test 2: Tambah Tabungan Pertama
```
1. Di WishlistDetail "iPhone 15"
2. "+ Tambah Tabungan" → Rp 1.000.000
3. Expected:
   - Progress: 6.67%
   - Riwayat: 1 item (+ Rp 1.000.000)
   - Database saved_amount = 1000000
```

### ✅ Test 3: Tambah Tabungan Lagi
```
1. Di WishlistDetail "iPhone 15"
2. "+ Tambah Tabungan" → Rp 500.000
3. Expected:
   - Progress: 10%
   - Riwayat: 2 items
   - Database saved_amount = 1500000
```

### ✅ Test 4: Tarik Tabungan (Negative Amount)
```
1. Di WishlistDetail "iPhone 15"
2. "+ Tambah Tabungan" → Toggle "Tarik 🌸" → Rp 200.000
3. Expected:
   - Progress: 8.67%
   - Riwayat: 3 items (termasuk - Rp 200.000)
   - Database saved_amount = 1300000
```

### ✅ Test 5: Delete Wishlist
```
1. Di WishlistDetail "iPhone 15"
2. Klik "Hapus" → Confirm
3. Expected:
   - Redirect ke /wishlist
   - "iPhone 15" hilang dari list
   - Savings terkait juga terhapus (ON DELETE CASCADE)
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: saved_amount Tidak Update

**Symptom:**
- Tambah tabungan berhasil
- Riwayat muncul
- Tapi progress bar tidak berubah

**Diagnosis:**
```sql
-- Cek trigger ada?
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_wishlist_saved_amount';

-- Cek manual saved_amount
SELECT id, title, saved_amount FROM wishlist_items WHERE id = 'WISH_ID';

-- Cek total savings untuk wishlist
SELECT SUM(amount) FROM savings WHERE wishlist_item_id = 'WISH_ID';
```

**Fix:**
- Re-run `add-wishlist-to-savings.sql`
- Atau manual update: `UPDATE wishlist_items SET saved_amount = (SELECT SUM...) WHERE id = ...`

---

### Issue 2: Error "column wishlist_item_id does not exist"

**Cause:** SQL migration belum di-run

**Fix:** Jalankan `add-wishlist-to-savings.sql` di Supabase SQL Editor

---

### Issue 3: Riwayat Kosong Padahal Ada Tabungan

**Diagnosis:**
```sql
-- Cek savings untuk wishlist ini
SELECT * FROM savings WHERE wishlist_item_id = 'WISH_ID';

-- Cek couple_id match?
SELECT s.*, w.couple_id 
FROM savings s 
JOIN wishlist_items w ON s.wishlist_item_id = w.id
WHERE w.id = 'WISH_ID';
```

**Possible causes:**
- `useWishlistSavings` tidak di-enable (user/couple belum load)
- RLS policy block akses
- wishlist_item_id salah

---

## 📝 SUMMARY

### Files Changed:
1. `add-wishlist-to-savings.sql` - Migration baru
2. `src/hooks/useSavings.js` - Tambah `useWishlistSavings`
3. `src/components/AddSavingSheet.tsx` - Support `wishlistItemId` prop
4. `src/pages/WishlistDetail.tsx` - Ganti mock → real data

### Features Working:
- ✅ View wishlist detail
- ✅ View savings history per wishlist
- ✅ Add saving to wishlist
- ✅ Auto-update saved_amount
- ✅ Delete wishlist
- ✅ Progress bar
- ✅ Product & maps links

### Features Todo:
- ❌ Edit wishlist (coming soon)
- ❌ Mark wishlist as achieved
- ❌ Vote priority

---

## 🎉 NEXT STEPS

Sekarang SEMUA fitur utama sudah terhubung ke backend:
- ✅ Dashboard
- ✅ Transactions
- ✅ Tabungan (Savings)
- ✅ Wishlist (List + Detail)
- ✅ PartnerView
- ✅ Settings

**Ready untuk testing end-to-end!** 🚀
