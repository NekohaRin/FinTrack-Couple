import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { queryClient } from '../lib/queryClient'

const EMOJIS = ['📱', '✈️', '🏠', '👗', '🍰', '💎', '🎮', '🚗', '🎁', '💄', '🏋️', '📚', '🌸', '🎵', '🐾', '🌿']

export function AddCategorySheet({
  open,
  onClose,
  coupleId,
  existingCategories,
}: {
  open: boolean
  onClose: () => void
  coupleId: string
  existingCategories: { key: string; label: string; emoji: string }[]
}) {
  const [emoji, setEmoji] = useState('✨')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Nama kategori wajib diisi'); return }
    setError('')
    setLoading(true)

    const newCat = {
      key: name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      label: name.trim(),
      emoji,
    }

    const updated = [...existingCategories, newCat]

    try {
      const { error: err } = await supabase
        .from('couples')
        .update({ wishlist_categories: updated })
        .eq('id', coupleId)

      if (err) throw err

      queryClient.invalidateQueries({ queryKey: ['couple'] })
      setName('')
      setEmoji('✨')
      onClose()
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan kategori')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-[2rem] bg-gradient-blush shadow-pink p-6 pb-8">
        <div className="flex justify-center mb-3">
          <div className="h-1.5 w-12 rounded-full bg-primary/30" />
        </div>
        <button onClick={onClose} className="absolute right-5 top-5 h-8 w-8 rounded-full glass flex items-center justify-center">
          <X size={16} />
        </button>
        <h3 className="font-script text-3xl text-center">Kategori Baru ✦</h3>

        <div className="mt-5">
          <p className="text-xs text-muted-foreground mb-2">Pilih emoji</p>
          <div className="grid grid-cols-8 gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`h-10 w-10 rounded-2xl text-xl flex items-center justify-center transition ${emoji === e ? 'bg-gradient-pink shadow-pink scale-110' : 'glass'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama kategori..."
            className="w-full glass rounded-2xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>

        {error && <p className="text-xs text-red-400 text-center mt-2">{error}</p>}

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-6 w-full py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan ✨'}
        </button>
      </div>
    </div>
  )
}