import { useState } from 'react'
import { X, Calendar, Pencil } from 'lucide-react'
import { useAddTransaction } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'

export function AddTransactionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  
  // Fetch categories dan mutation
  const { data: categories = [] } = useCategories('personal')
  const addTransaction = useAddTransaction()
  
  // Set default category ketika categories loaded
  if (categories.length > 0 && !categoryId) {
    setCategoryId(categories[0].id)
  }
  
  async function handleSubmit() {
    if (!amount || parseFloat(amount) === 0) {
      alert('Masukkan jumlah yang valid!')
      return
    }
    
    if (!categoryId) {
      alert('Pilih kategori!')
      return
    }
    
    try {
      await addTransaction.mutateAsync({
        amount: parseFloat(amount),
        type,
        category_id: categoryId,
        note: note || null,
        date,
      })
      
      // Reset form
      setAmount('')
      setNote('')
      setDate(new Date().toISOString().slice(0, 10))
      
      // Close sheet
      onClose()
      
      console.log('✅ Transaksi berhasil ditambahkan!')
    } catch (error: any) {
      console.error('❌ Error adding transaction:', error)
      alert('Gagal menambahkan transaksi: ' + error.message)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-[2rem] bg-gradient-blush shadow-pink p-6 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center mb-3">
          <div className="h-1.5 w-12 rounded-full bg-primary/30" />
        </div>
        <button onClick={onClose} className="absolute right-5 top-5 h-8 w-8 rounded-full glass flex items-center justify-center">
          <X size={16} />
        </button>
        <h3 className="font-script text-3xl text-center">Transaksi Baru ✦</h3>

        <div className="mt-5 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Jumlah</div>
          <div className="inline-flex items-baseline gap-1 border-b-2 border-primary px-2 pb-1">
            <span className="font-script text-xl text-primary">Rp</span>
            <input
              autoFocus
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="font-script text-5xl bg-transparent outline-none w-44 text-center placeholder:text-primary/30"
            />
          </div>
        </div>

        <div className="mt-5 glass rounded-full p-1 flex">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${type === 'expense' ? 'bg-gradient-pink text-white shadow-pink' : 'text-muted-foreground'}`}
          >
            Pengeluaran 🌸
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${type === 'income' ? 'bg-emerald-300 text-white shadow-soft' : 'text-muted-foreground'}`}
          >
            Pemasukan 💚
          </button>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold mb-2 text-muted-foreground">Kategori</div>
          {categories.length === 0 ? (
            <div className="glass rounded-2xl p-4 text-center text-sm text-muted-foreground">
              Memuat kategori...
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`rounded-2xl py-2.5 flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${categoryId === c.id ? 'bg-gradient-pink text-white shadow-pink' : 'glass text-muted-foreground'}`}
                  style={categoryId === c.id ? {} : { color: c.color }}
                >
                  <span className="text-lg">{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
            <Pencil size={14} className="text-primary" />
            <input 
              placeholder="Catatan manis…" 
              value={note}
              onChange={e => setNote(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" 
            />
          </div>
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm" 
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={addTransaction.isPending}
          className="mt-6 w-full py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink disabled:opacity-50"
        >
          {addTransaction.isPending ? 'Menyimpan...' : 'Simpan ✨'}
        </button>
      </div>
    </div>
  )
}