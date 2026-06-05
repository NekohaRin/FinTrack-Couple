# 🔌 Panduan Koneksi ke Supabase

> Dokumentasi lengkap untuk menghubungkan aplikasi FinTrack Couple ke database Supabase

---

## 📋 Overview

Saya sudah membuat semua hooks dan infrastructure yang dibutuhkan untuk menghubungkan aplikasi ke Supabase. Berikut yang sudah dibuat:

### ✅ Hooks yang Sudah Dibuat:

| Hook File | Fungsi | Hooks yang Tersedia |
|-----------|--------|---------------------|
| `useTransactions.js` | Kelola transaksi pribadi | `useTransactions`<br>`useAddTransaction`<br>`useUpdateTransaction`<br>`useDeleteTransaction`<br>`useDashboardSummary`<br>`useTransactionsByPeriod` |
| `useSavings.js` | Kelola tabungan berdua | `useSavings`<br>`useAddSaving`<br>`useUpdateSaving`<br>`useDeleteSaving`<br>`useSavingsSummary` |
| `useWishlist.js` | Kelola wishlist | `useWishlist`<br>`useWishlistItem`<br>`useAddWishlistItem`<br>`useUpdateWishlistItem`<br>`useDeleteWishlistItem`<br>`useToggleWishlistVote`<br>`useMarkWishlistAchieved` |
| `usePartnerTransactions.js` | Lihat transaksi pasangan | `usePartnerTransactions`<br>`usePartnerSummary`<br>`usePartnerInfo` |
| `useCategories.js` | Kelola kategori | `useCategories`<br>`useAddCategory`<br>`useUpdateCategory`<br>`useDeleteCategory`<br>`useCreateDefaultCategories` |

### ✅ SQL Script:

- `create-savings-table.sql` - Script untuk membuat tabel savings di Supabase

---

## 🚀 Step 1: Setup Database

### 1.1. Buat Tabel Savings

```bash
# 1. Buka Supabase Dashboard → SQL Editor
# 2. Copy paste isi file create-savings-table.sql
# 3. Klik Run
```

**Verifikasi:**
```sql
-- Cek tabel sudah dibuat
SELECT * FROM savings LIMIT 1;

-- Cek RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'savings';
```

### 1.2. Update Schema wishlist_items (Tambah Field Baru)

Dari UPDATE_FITUR.md, wishlist sekarang punya field tambahan untuk link produk dan maps:

```sql
-- Tambah kolom jika belum ada
ALTER TABLE wishlist_items 
ADD COLUMN IF NOT EXISTS product_link text,
ADD COLUMN IF NOT EXISTS maps_link text,
ADD COLUMN IF NOT EXISTS emoji text DEFAULT '🎯',
ADD COLUMN IF NOT EXISTS category text DEFAULT 'liburan';

-- Tambah kolom note jika belum ada (untuk deskripsi wishlist)
ALTER TABLE wishlist_items 
ADD COLUMN IF NOT EXISTS note text;
```

### 1.3. Pastikan User Punya Kategori Default

Setiap user baru butuh kategori default. Tambahkan trigger atau buat manual:

```sql
-- Function untuk create default categories
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO categories (owner_id, name, icon, color, scope) VALUES
    (user_uuid, 'Makanan & Minuman', '🍔', '#FF6B6B', 'personal'),
    (user_uuid, 'Transport', '🚗', '#4ECDC4', 'personal'),
    (user_uuid, 'Belanja', '🛍️', '#FFE66D', 'personal'),
    (user_uuid, 'Tagihan', '📱', '#95E1D3', 'personal'),
    (user_uuid, 'Hiburan', '🎮', '#F38181', 'personal'),
    (user_uuid, 'Kesehatan', '💊', '#A8E6CF', 'personal'),
    (user_uuid, 'Pendidikan', '📚', '#FFAAA5', 'personal'),
    (user_uuid, 'Lainnya', '📦', '#B4A7D6', 'personal');
END;
$$ LANGUAGE plpgsql;

-- Update trigger handle_new_user untuk include categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Buat profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- Buat default categories
  PERFORM create_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎯 Step 2: Update Komponen

### 2.1. Dashboard.tsx

**Update untuk menggunakan data real:**

```tsx
import { useDashboardSummary, useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../hooks/useAuth'
import { fmtIDR } from '../lib/formatCurrency'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary()
  const { data: transactions, isLoading: loadingTxs } = useTransactions()
  
  // Ambil 5 transaksi terakhir
  const recentTransactions = transactions?.slice(0, 5) || []
  
  if (loadingSummary || loadingTxs) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      {/* Summary Card */}
      <div className="glass rounded-3xl p-5">
        <h3>Saldo Bulan Ini</h3>
        <p className="text-3xl font-bold">{fmtIDR(summary?.balance || 0)}</p>
        <div className="flex gap-4 mt-3">
          <div>
            <span className="text-xs">Pemasukan</span>
            <p className="text-emerald-600">{fmtIDR(summary?.income || 0)}</p>
          </div>
          <div>
            <span className="text-xs">Pengeluaran</span>
            <p className="text-rose-500">{fmtIDR(summary?.expense || 0)}</p>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <h3>Transaksi Terbaru</h3>
      {recentTransactions.map(tx => (
        <TransactionItem key={tx.id} transaction={tx} />
      ))}
    </div>
  )
}
```

### 2.2. AddTransactionSheet.tsx

**Update untuk simpan data real:**

```tsx
import { useAddTransaction } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { toast } from 'sonner'

export function AddTransactionSheet({ open, onClose }) {
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category_id: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  })
  
  const { data: categories } = useCategories('personal')
  const addTransaction = useAddTransaction()
  
  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      await addTransaction.mutateAsync({
        amount: parseFloat(form.amount),
        type: form.type,
        category_id: form.category_id,
        note: form.note,
        date: form.date,
      })
      
      toast.success('Transaksi berhasil ditambahkan! 💕')
      onClose()
      setForm({ amount: '', type: 'expense', category_id: '', note: '', date: new Date().toISOString().split('T')[0] })
    } catch (error) {
      toast.error('Gagal menambahkan transaksi: ' + error.message)
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/* ... form UI ... */}
      <form onSubmit={handleSubmit}>
        {/* Input fields */}
        <button type="submit" disabled={addTransaction.isPending}>
          {addTransaction.isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </Sheet>
  )
}
```

### 2.3. Tabungan.tsx

**Update untuk menggunakan data real:**

```tsx
import { useSavings, useSavingsSummary } from '../hooks/useSavings'
import { fmtIDR } from '../lib/formatCurrency'

export default function Tabungan() {
  const { data: savings, isLoading: loadingSavings } = useSavings()
  const { data: summary, isLoading: loadingSummary } = useSavingsSummary()
  
  if (loadingSavings || loadingSummary) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      {/* Total Tabungan */}
      <div className="glass rounded-3xl p-5">
        <h3>Total Tabungan</h3>
        <p className="text-4xl font-script">{fmtIDR(summary?.total || 0)}</p>
        <p className="text-xs">{summary?.count || 0} kontribusi</p>
      </div>
      
      {/* Riwayat */}
      <h3>Riwayat Tabungan</h3>
      {savings?.map(saving => (
        <SavingItem key={saving.id} saving={saving} />
      ))}
    </div>
  )
}
```

### 2.4. Wishlist.tsx

**Update untuk menggunakan data real:**

```tsx
import { useWishlist } from '../hooks/useWishlist'
import { fmtIDR } from '../lib/formatCurrency'

export default function Wishlist() {
  const { data: wishlist, isLoading } = useWishlist()
  const [activeTab, setActiveTab] = useState('semua')
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  // Filter berdasarkan kategori
  const filtered = activeTab === 'semua' 
    ? wishlist 
    : wishlist?.filter(w => w.category === activeTab)
  
  return (
    <div>
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {['semua', 'liburan', 'barang', 'acara'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={activeTab === cat ? 'active' : ''}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Wishlist Items */}
      {filtered?.map(wish => (
        <WishlistCard key={wish.id} wish={wish} />
      ))}
    </div>
  )
}
```

### 2.5. PartnerView.tsx

**Update untuk menggunakan data real:**

```tsx
import { usePartnerTransactions, usePartnerSummary, usePartnerInfo } from '../hooks/usePartnerTransactions'
import { fmtIDR } from '../lib/formatCurrency'

export default function PartnerView() {
  const { data: partner } = usePartnerInfo()
  const { data: summary } = usePartnerSummary()
  const { data: transactions } = usePartnerTransactions()
  
  return (
    <div>
      {/* Partner Info */}
      <div className="text-center">
        <AvatarPhoto src={partner?.avatar_url} name={partner?.display_name} size="lg" />
        <h1>{partner?.display_name || 'Partner'}</h1>
      </div>
      
      {/* Summary */}
      <div className="glass rounded-3xl p-5">
        <h3>Saldo {partner?.display_name}</h3>
        <p className="text-3xl">{fmtIDR(summary?.balance || 0)}</p>
      </div>
      
      {/* Transactions (Read Only) */}
      <h3>Transaksi {partner?.display_name}</h3>
      {transactions?.map(tx => (
        <TransactionItem key={tx.id} transaction={tx} readOnly />
      ))}
    </div>
  )
}
```

---

## 🔧 Step 3: Update Mock Data ke Real Data

### Hapus atau Comment Mock Data

Di `src/lib/mock.ts`, tambahkan comment bahwa ini sudah tidak dipakai:

```typescript
// DEPRECATED: Mock data ini sudah diganti dengan data real dari Supabase
// File ini hanya digunakan untuk fallback development
```

### Update Import di Komponen

Ganti semua:
```tsx
import { TRANSACTIONS, WISHES, SAVINGS } from '../lib/mock'
```

Menjadi:
```tsx
import { useTransactions } from '../hooks/useTransactions'
import { useWishlist } from '../hooks/useWishlist'
import { useSavings } from '../hooks/useSavings'
```

---

## 📦 Step 4: Install Dependencies (Jika Perlu)

Pastikan semua dependency sudah terinstall:

```bash
npm install @tanstack/react-query @supabase/supabase-js
```

Sudah ada di `package.json`, tapi pastikan versi terbaru:
- `@supabase/supabase-js`: ^2.45.0+
- `@tanstack/react-query`: ^5.51.0+

---

## 🧪 Step 5: Testing

### 5.1. Test Dashboard

1. Login ke aplikasi
2. Buka Dashboard
3. Console browser harus menampilkan:
   ```
   ✅ Transactions loaded: 0
   ✅ Dashboard summary: { income: 0, expense: 0, balance: 0 }
   ```
4. Tambah transaksi baru via AddTransactionSheet
5. Transaksi harus muncul di Dashboard

### 5.2. Test Tabungan

1. Buka halaman Tabungan
2. Console: `✅ Savings loaded: 0`
3. Tambah saving baru
4. Total tabungan harus update

### 5.3. Test Wishlist

1. Buka halaman Wishlist
2. Console: `✅ Wishlist loaded: 0`
3. Tambah wishlist baru dengan kategori
4. Item muncul di tab yang sesuai

### 5.4. Test Partner View

1. Pastikan sudah couple dengan user lain
2. Buka Partner View
3. Harus muncul nama pasangan dan transaksinya

---

## 🎨 Step 6: UI Polish

### Loading States

Tambahkan loading skeleton di setiap halaman:

```tsx
if (isLoading) {
  return (
    <div className="p-4 space-y-3">
      <div className="glass rounded-3xl h-32 animate-pulse" />
      <div className="glass rounded-2xl h-20 animate-pulse" />
      <div className="glass rounded-2xl h-20 animate-pulse" />
    </div>
  )
}
```

### Empty States

Tambahkan empty state ketika belum ada data:

```tsx
if (!transactions?.length) {
  return (
    <div className="text-center py-12">
      <p className="text-4xl mb-2">💸</p>
      <p className="text-muted-foreground">Belum ada transaksi</p>
      <button onClick={() => setOpenSheet(true)}>
        Tambah Transaksi Pertama
      </button>
    </div>
  )
}
```

### Error States

Tambahkan error handling:

```tsx
if (error) {
  return (
    <div className="text-center py-12">
      <p className="text-4xl mb-2">😢</p>
      <p className="text-rose-500">Gagal memuat data</p>
      <button onClick={() => refetch()}>Coba Lagi</button>
    </div>
  )
}
```

---

## 📝 Checklist Koneksi

### Database:
- [ ] Tabel `savings` sudah dibuat
- [ ] RLS policies untuk `savings` sudah aktif
- [ ] Kolom `product_link`, `maps_link`, `emoji`, `category`, `note` sudah ada di `wishlist_items`
- [ ] Trigger `handle_new_user` sudah include create default categories
- [ ] Test query manual di Supabase SQL Editor

### Hooks:
- [ ] `useTransactions.js` sudah dibuat
- [ ] `useSavings.js` sudah dibuat
- [ ] `useWishlist.js` sudah dibuat
- [ ] `usePartnerTransactions.js` sudah dibuat
- [ ] `useCategories.js` sudah dibuat

### Komponen:
- [ ] `Dashboard.tsx` update menggunakan `useTransactions` & `useDashboardSummary`
- [ ] `AddTransactionSheet.tsx` update menggunakan `useAddTransaction`
- [ ] `Tabungan.tsx` update menggunakan `useSavings`
- [ ] `AddSavingSheet.tsx` update menggunakan `useAddSaving`
- [ ] `Wishlist.tsx` update menggunakan `useWishlist`
- [ ] `WishlistDetail.tsx` update menggunakan `useWishlistItem`
- [ ] `AddWishlistSheet.tsx` update menggunakan `useAddWishlistItem`
- [ ] `PartnerView.tsx` update menggunakan `usePartnerTransactions`
- [ ] `Settings.tsx` update menggunakan `useProfile` (sudah ada)

### Testing:
- [ ] Bisa add transaction → muncul di Dashboard
- [ ] Bisa add saving → total tabungan update
- [ ] Bisa add wishlist → muncul di list
- [ ] Partner view menampilkan transaksi pasangan
- [ ] Loading states berfungsi
- [ ] Empty states tampil ketika belum ada data
- [ ] Error handling berfungsi

---

## 🚨 Troubleshooting

### Error: "relation savings does not exist"
**Solusi:** Jalankan `create-savings-table.sql` di Supabase SQL Editor

### Error: "permission denied for table X"
**Solusi:** Cek RLS policies dengan:
```sql
SELECT * FROM pg_policies WHERE tablename = 'X';
```

### Data tidak muncul meski query berhasil
**Solusi:** 
1. Cek console browser untuk error
2. Pastikan `queryKey` di useQuery benar
3. Cek RLS policy tidak terlalu ketat

### Kategori tidak ada saat add transaction
**Solusi:** Create default categories manual:
```tsx
const { mutate: createDefaults } = useCreateDefaultCategories()
createDefaults()
```

---

## 🎉 Selesai!

Setelah semua checklist di atas selesai, aplikasi Anda sudah fully connected ke Supabase!

### Yang Sudah Berfungsi:
- ✅ Auth & Onboarding (sudah dari sebelumnya)
- ✅ Dashboard dengan data real
- ✅ Add/Edit/Delete Transaction
- ✅ Partner View (read-only)
- ✅ Tabungan Berdua
- ✅ Wishlist dengan kategori & detail
- ✅ Settings (profile)

### Next Steps:
1. Implement realtime notifications
2. Upload foto profil ke Supabase Storage
3. Tema warna persist
4. Budget tracking
5. Deploy ke production

---

**Need help?** Jika ada error saat koneksi:
1. Share screenshot console browser
2. Share error message lengkap
3. Jalankan query diagnostic di Supabase

**Happy coding! 🚀**
