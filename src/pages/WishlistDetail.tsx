import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Link2, MapPin, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { AddSavingSheet } from '../components/AddSavingSheet'
import { AvatarPhoto } from '../components/AvatarPhoto'
import { useWishlistItem, useDeleteWishlistItem } from '../hooks/useWishlist'
import { useWishlistSavings } from '../hooks/useSavings'
import { useAuth } from '../hooks/useAuth'
import { useCouple } from '../hooks/useCouple'
import { fmtIDR } from '../lib/formatCurrency'
import { formatDate } from '../lib/formatDate'

const WISH_CATEGORIES = [
  { key: "electronics", label: "Elektronik", emoji: "📱" },
  { key: "travel", label: "Liburan", emoji: "✈️" },
  { key: "home", label: "Rumah", emoji: "🏠" },
  { key: "fashion", label: "Fashion", emoji: "👗" },
]

export default function WishlistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: couple } = useCouple()
  const [openSaving, setOpenSaving] = useState(false)

  const { data: wish, isLoading: wishLoading } = useWishlistItem(id!)
  const { data: savings, isLoading: savingsLoading } = useWishlistSavings(id!)
  const deleteWishlist = useDeleteWishlistItem()

  async function handleDelete() {
    if (!wish) return
    const confirmed = window.confirm(`Hapus impian "${wish.title}"? Riwayat tabungan akan hilang juga.`)
    if (!confirmed) return
    
    try {
      await deleteWishlist.mutateAsync(wish.id)
      navigate('/wishlist')
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`)
    }
  }

  if (wishLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!wish) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Impian tidak ditemukan 💔</p>
      </div>
    )
  }

  const saved = parseFloat(String(wish.saved_amount || 0))
  const target = parseFloat(String(wish.target_price || 1))
  const pct = Math.min(100, Math.round((saved / target) * 100))
  const cat = WISH_CATEGORIES.find((c) => c.key === wish.category)

  return (
    <div className="min-h-screen pb-32 px-4 pt-6 relative overflow-hidden" style={{ background: '#FFF5F9' }}>

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-primary font-semibold mb-6"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="flex flex-col items-center mb-6">
        <div className="h-24 w-24 rounded-full bg-pink-50 flex items-center justify-center text-5xl shadow-pink" style={{ border: '1px solid rgba(251,191,36,0.4)' }}>
          {wish.emoji || '✨'}
        </div>
        <h1 className="font-script text-4xl mt-3 text-center">{wish.title}</h1>
        {cat && (
          <span className="mt-1 text-xs px-3 py-1 rounded-full bg-pink-100 text-primary font-semibold">
            {cat.emoji} {cat.label}
          </span>
        )}
        {wish.note && (
          <p className="mt-2 text-sm text-muted-foreground text-center px-4">{wish.note}</p>
        )}
      </div>

      <div className="glass rounded-3xl p-5 shadow-pink mb-4" style={{ border: '1px solid rgba(251,191,36,0.4)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Progress Tabungan</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-pink-100 overflow-hidden">
          <div className="h-full bg-gradient-pink transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-script text-lg text-primary">{fmtIDR(saved)}</span>
          <span className="text-xs text-muted-foreground">dari {fmtIDR(target)}</span>
        </div>
        <button
          onClick={() => setOpenSaving(true)}
          className="mt-4 w-full py-3 rounded-full bg-gradient-pink text-white font-semibold shadow-pink text-sm"
        >
          + Tambah Tabungan
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {wish.product_link ? (
          <a
            href={wish.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center text-primary transition active:scale-95"
            style={{ border: '1px solid rgba(251,191,36,0.4)' }}
          >
            <div className="flex items-center gap-1">
              <Link2 size={16} />
              <ExternalLink size={12} />
            </div>
            <span className="text-xs font-semibold">Buka Link Produk</span>
          </a>
        ) : (
          <div
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center opacity-50"
            style={{ border: '1px solid rgba(251,191,36,0.4)' }}
          >
            <Link2 size={16} className="text-primary" />
            <span className="text-xs font-semibold">Belum ada link</span>
          </div>
        )}

        {wish.maps_link ? (
          <a
            href={wish.maps_link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center text-primary transition active:scale-95"
            style={{ border: '1px solid rgba(251,191,36,0.4)' }}
          >
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <ExternalLink size={12} />
            </div>
            <span className="text-xs font-semibold">Lihat di Maps</span>
          </a>
        ) : (
          <div
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center opacity-50"
            style={{ border: '1px solid rgba(251,191,36,0.4)' }}
          >
            <MapPin size={16} className="text-primary" />
            <span className="text-xs font-semibold">Belum ada lokasi</span>
          </div>
        )}
      </div>

      <h2 className="font-script text-2xl mb-3">Riwayat 📖</h2>
      
      {savingsLoading && (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="glass rounded-2xl h-16 animate-pulse" />
          ))}
        </div>
      )}
      
      {!savingsLoading && (!savings || savings.length === 0) && (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-4xl mb-2">💕</p>
          <p className="text-muted-foreground text-sm">Belum ada tabungan untuk impian ini</p>
        </div>
      )}
      
      {!savingsLoading && savings && savings.length > 0 && (
        <div className="space-y-2">
          {savings.map((s) => {
            const isMine = s.added_by === user?.id
            const profile = s.added_by_profile
            const name = profile?.display_name || (isMine ? 'Saya' : 'Pasangan')
            const avatar = profile?.avatar_url
            const positive = parseFloat(s.amount) > 0
            
            return (
              <div key={s.id} className="glass rounded-2xl p-3 flex items-center gap-3 shadow-soft">
                <AvatarPhoto 
                  src={avatar} 
                  name={name} 
                  size="sm"
                  className={isMine ? 'ring-primary' : 'ring-pink-400'}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.note || 'Tabungan'}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {name} • {formatDate(s.date)}
                  </p>
                </div>
                <span className={`text-sm font-bold ${positive ? 'text-emerald-600' : 'text-rose-400'}`}>
                  {positive ? '+' : '−'} {fmtIDR(Math.abs(parseFloat(s.amount)))}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/80 backdrop-blur-sm border-t border-pink-100 px-4 py-3 flex gap-3 z-30">
        <button 
          onClick={() => alert('Fitur edit coming soon!')}
          className="flex-1 py-2.5 rounded-full border-2 border-primary text-primary font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Pencil size={14} /> Edit
        </button>
        <button 
          onClick={handleDelete}
          disabled={deleteWishlist.isPending}
          className="flex-1 py-2.5 rounded-full border-2 border-rose-300 text-rose-400 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Trash2 size={14} /> {deleteWishlist.isPending ? 'Menghapus...' : 'Hapus'}
        </button>
      </div>

      <AddSavingSheet 
        open={openSaving} 
        onClose={() => setOpenSaving(false)} 
        wishlistItemId={id}
      />
    </div>
  )
}