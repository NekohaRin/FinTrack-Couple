export type Tx = {
  id: string
  name: string
  category: string
  emoji: string
  amount: number
  date: string
  by?: 'me' | 'partner'
}

export const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(Math.abs(n))
    .replace('Rp', 'Rp ')

export const ME = {
  name: 'Sayang',
  initial: 'S',
  email: 'sayang@fintrack.id',
  photo: 'https://i.pravatar.cc/200?img=47',
}

export const PARTNER = {
  name: 'Cinta',
  initial: 'C',
  photo: 'https://i.pravatar.cc/200?img=32',
  connectedSince: '14 Februari 2024',
}
export const CATEGORIES = [
  { key: 'food', label: 'Makanan', emoji: '🍰' },
  { key: 'date', label: 'Kencan', emoji: '💞' },
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'shopping', label: 'Belanja', emoji: '🛍️' },
  { key: 'home', label: 'Rumah', emoji: '🏡' },
  { key: 'gift', label: 'Hadiah', emoji: '🎁' },
  { key: 'salary', label: 'Gaji', emoji: '💖' },
  { key: 'other', label: 'Lainnya', emoji: '✨' },
]

export const TRANSACTIONS: Tx[] = [
  { id: '1', name: 'Dinner di Sushi Tei', category: 'Kencan', emoji: '💞', amount: -385000, date: new Date().toISOString(), by: 'me' },
  { id: '2', name: 'Gaji bulanan', category: 'Gaji', emoji: '💖', amount: 8500000, date: new Date(Date.now() - 2*86400000).toISOString(), by: 'me' },
  { id: '3', name: 'Bunga mawar 🌹', category: 'Hadiah', emoji: '🎁', amount: -125000, date: new Date(Date.now() - 3*86400000).toISOString(), by: 'partner' },
  { id: '4', name: 'Groceries mingguan', category: 'Rumah', emoji: '🏡', amount: -540000, date: new Date(Date.now() - 5*86400000).toISOString(), by: 'partner' },
  { id: '5', name: 'Bioskop berdua', category: 'Kencan', emoji: '💞', amount: -180000, date: new Date(Date.now() - 6*86400000).toISOString(), by: 'me' },
  { id: '6', name: 'Cafe pagi', category: 'Makanan', emoji: '🍰', amount: -78000, date: new Date(Date.now() - 8*86400000).toISOString(), by: 'partner' },
]

export type WishCategory = { key: string; label: string; emoji: string }
export const WISH_CATEGORIES: WishCategory[] = [
  { key: 'electronics', label: 'Elektronik', emoji: '📱' },
  { key: 'travel', label: 'Liburan', emoji: '✈️' },
  { key: 'home', label: 'Rumah', emoji: '🏠' },
  { key: 'fashion', label: 'Fashion', emoji: '👗' },
]

export type Wish = {
  id: string
  title: string
  emoji: string
  category: string
  target: number
  saved: number
  note?: string
  productLink?: string
  mapsLink?: string
}

export const WISHES: Wish[] = [
  { id: '1', title: 'Honeymoon ke Bali', emoji: '🌴', category: 'travel', target: 15000000, saved: 6200000, note: 'Villa private 5 hari, sunset di Uluwatu 💕', mapsLink: 'https://maps.google.com/?q=Bali' },
  { id: '2', title: 'Apartemen impian', emoji: '🏠', category: 'home', target: 250000000, saved: 42000000, note: 'Studio 2BR view kota, balcony romantis' },
  { id: '3', title: 'Cincin tunangan', emoji: '💍', category: 'fashion', target: 12000000, saved: 9800000, note: 'Solitaire 0.5ct, white gold', productLink: 'https://example.com/ring' },
  { id: '4', title: 'Kamera baru', emoji: '📷', category: 'electronics', target: 8000000, saved: 1500000, note: 'Untuk abadiin momen kita', productLink: 'https://example.com/cam' },
]

export type Saving = {
  id: string
  amount: number
  note?: string
  date: string
  by: 'me' | 'partner'
}

export const SAVINGS: Saving[] = [
  { id: 's1', amount: 1500000, note: 'Bonus akhir bulan 💖', date: new Date().toISOString(), by: 'me' },
  { id: 's2', amount: 800000, note: 'Hemat ngopi minggu ini', date: new Date(Date.now() - 3*86400000).toISOString(), by: 'partner' },
  { id: 's3', amount: 2000000, note: 'Tabungan rutin', date: new Date(Date.now() - 7*86400000).toISOString(), by: 'me' },
  { id: 's4', amount: -350000, note: 'Beli kado anniversary', date: new Date(Date.now() - 14*86400000).toISOString(), by: 'partner' },
  { id: 's5', amount: 1200000, note: 'Freelance project', date: new Date(Date.now() - 21*86400000).toISOString(), by: 'me' },
]

export const SAVING_GOAL = 20000000