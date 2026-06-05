# ⚡ Quick Connect Backend

> Panduan singkat untuk menghubungkan aplikasi ke Supabase

---

## 🎯 3 Langkah Cepat

### 1️⃣ Setup Database (5 menit)

**A. Buka Supabase Dashboard → SQL Editor**

**B. Jalankan 2 script ini secara berurutan:**

```bash
# Script 1: Buat tabel savings
# Copy paste isi file: create-savings-table.sql
# Klik Run

# Script 2: Update schema untuk fitur baru  
# Copy paste isi file: update-schema-for-new-features.sql
# Klik Run
```

**C. Verifikasi:**
```sql
-- Cek tabel savings ada
SELECT * FROM savings LIMIT 1;

-- Cek wishlist_items punya kolom baru
SELECT product_link, maps_link, emoji, category 
FROM wishlist_items LIMIT 1;

-- Cek user punya categories
SELECT COUNT(*) FROM categories;
```

---

### 2️⃣ Import Hooks di Komponen (2 menit per halaman)

**Dashboard.tsx:**
```tsx
import { useDashboardSummary, useTransactions } from '../hooks/useTransactions'

export default function Dashboard() {
  const { data: summary } = useDashboardSummary()
  const { data: transactions } = useTransactions()
  
  // Ganti mock data dengan transactions
  return <div>...</div>
}
```

**Tabungan.tsx:**
```tsx
import { useSavings, useSavingsSummary } from '../hooks/useSavings'

export default function Tabungan() {
  const { data: savings } = useSavings()
  const { data: summary } = useSavingsSummary()
  
  return <div>...</div>
}
```

**Wishlist.tsx:**
```tsx
import { useWishlist } from '../hooks/useWishlist'

export default function Wishlist() {
  const { data: wishlist } = useWishlist()
  
  return <div>...</div>
}
```

**PartnerView.tsx:**
```tsx
import { usePartnerTransactions, usePartnerSummary } from '../hooks/usePartnerTransactions'

export default function PartnerView() {
  const { data: transactions } = usePartnerTransactions()
  const { data: summary } = usePartnerSummary()
  
  return <div>...</div>
}
```

**AddTransactionSheet.tsx:**
```tsx
import { useAddTransaction } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'

export function AddTransactionSheet({ open, onClose }) {
  const addTransaction = useAddTransaction()
  const { data: categories } = useCategories('personal')
  
  async function handleSubmit() {
    await addTransaction.mutateAsync({
      amount: parseFloat(form.amount),
      type: form.type,
      category_id: form.category_id,
      note: form.note,
      date: form.date,
    })
  }
}
```

---

### 3️⃣ Test (3 menit)

```bash
# Jalankan aplikasi
npm run dev

# Test di browser:
1. Login
2. Buka Dashboard → harus kosong (belum ada transaksi)
3. Tambah transaksi baru → muncul di list
4. Buka Tabungan → total = 0
5. Tambah saving → total update
6. Buka Wishlist → kosong
7. Tambah wishlist → muncul

# Cek console browser:
✅ Transactions loaded: 1
✅ Savings loaded: 1
✅ Wishlist loaded: 1
```

---

## 📋 Files yang Sudah Dibuat

| File | Fungsi |
|------|--------|
| `create-savings-table.sql` | Buat tabel savings + RLS |
| `update-schema-for-new-features.sql` | Update wishlist_items + trigger |
| `src/hooks/useTransactions.js` | Hooks untuk transaksi |
| `src/hooks/useSavings.js` | Hooks untuk tabungan |
| `src/hooks/useWishlist.js` | Hooks untuk wishlist |
| `src/hooks/usePartnerTransactions.js` | Hooks untuk partner view |
| `src/hooks/useCategories.js` | Hooks untuk kategori |
| `CONNECT-TO-SUPABASE.md` | Dokumentasi lengkap |

---

## 🔧 Pattern Penggunaan Hooks

### Fetch Data (Read):
```tsx
const { data, isLoading, error } = useTransactions()

if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>
return <div>{data.map(...)}</div>
```

### Add Data (Create):
```tsx
const addTransaction = useAddTransaction()

async function handleAdd() {
  try {
    await addTransaction.mutateAsync({ amount: 1000, ... })
    toast.success('Berhasil!')
  } catch (error) {
    toast.error('Gagal: ' + error.message)
  }
}
```

### Update Data:
```tsx
const updateTransaction = useUpdateTransaction()

await updateTransaction.mutateAsync({ 
  id: 'xxx', 
  amount: 2000 
})
```

### Delete Data:
```tsx
const deleteTransaction = useDeleteTransaction()

await deleteTransaction.mutateAsync('transaction-id')
```

---

## ✅ Checklist

- [ ] SQL script 1 (savings) dijalankan
- [ ] SQL script 2 (update schema) dijalankan
- [ ] Dashboard menggunakan `useTransactions`
- [ ] Tabungan menggunakan `useSavings`
- [ ] Wishlist menggunakan `useWishlist`
- [ ] Partner View menggunakan `usePartnerTransactions`
- [ ] AddTransactionSheet menggunakan `useAddTransaction`
- [ ] AddSavingSheet menggunakan `useAddSaving`
- [ ] AddWishlistSheet menggunakan `useAddWishlistItem`
- [ ] Test add transaksi → berhasil
- [ ] Test add saving → berhasil
- [ ] Test add wishlist → berhasil

---

## 🚨 Common Issues

**Error: "relation savings does not exist"**
→ Jalankan `create-savings-table.sql`

**Error: "column product_link does not exist"**
→ Jalankan `update-schema-for-new-features.sql`

**Error: "permission denied"**
→ Cek RLS policies di Supabase

**Kategori kosong saat add transaction**
→ Jalankan: `SELECT create_default_categories(auth.uid());` di SQL Editor (saat login sebagai user tersebut)

---

## 📖 Detail Lengkap

Lihat `CONNECT-TO-SUPABASE.md` untuk:
- Penjelasan setiap hook
- Contoh kode lengkap
- Loading & error states
- Troubleshooting detail

---

**Ready to connect!** 🚀 Mulai dari Step 1.
