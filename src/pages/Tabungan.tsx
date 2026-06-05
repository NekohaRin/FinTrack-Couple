import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { BottomNav } from '../components/BottomNav'
import { AddSavingSheet } from '../components/AddSavingSheet'
import { fmtIDR } from '../lib/formatCurrency'
import { useSavings, useSavingsSummary } from '../hooks/useSavings'
import { useAuth } from '../hooks/useAuth'
import { useCouple } from '../hooks/useCouple'
import { useProfile } from '../hooks/useProfile'

export default function Tabungan() {
  const [open, setOpen] = useState(false)
  
  // Fetch data dari Supabase
  const { user } = useAuth()
  const { data: couple } = useCouple()
  const { data: profile } = useProfile()
  const { data: savings, isLoading: loadingSavings } = useSavings()
  const { data: summary, isLoading: loadingSummary } = useSavingsSummary()

  // Loading state
  if (loadingSavings || loadingSummary) {
    return (
      <div className="min-h-screen pb-28 px-4 pt-6">
        <div className="space-y-3">
          <div className="glass rounded-3xl h-40 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl h-20 animate-pulse" />
            <div className="glass rounded-2xl h-20 animate-pulse" />
          </div>
          <div className="glass rounded-2xl h-20 animate-pulse" />
        </div>
      </div>
    )
  }

  const totalSaved = summary?.total || 0
  const SAVING_GOAL = 5000000 // TODO: Bisa dibuat dynamic dari settings
  const pct = Math.min(100, Math.round((totalSaved / SAVING_GOAL) * 100))
  
  // Calculate kontribusi masing-masing
  const myContrib = savings
    ?.filter(s => s.added_by === user?.id)
    .reduce((a, b) => a + parseFloat(String(b.amount)), 0) || 0
  
  const partnerContrib = savings
    ?.filter(s => s.added_by !== user?.id)
    .reduce((a, b) => a + parseFloat(String(b.amount)), 0) || 0
  
  // Get partner info
  const partnerId = couple?.user1_id === user?.id ? couple?.user2_id : couple?.user1_id
  const partnerName = couple?.user1_id === user?.id 
    ? couple?.user2?.display_name || 'Partner'
    : couple?.user1?.display_name || 'Partner'
  
  const myName = profile?.display_name || 'Saya'
  const myInitial = myName.charAt(0).toUpperCase()
  const partnerInitial = partnerName.charAt(0).toUpperCase()

  return (
    <>
      <div className="min-h-screen pb-28 px-4 pt-6 relative overflow-hidden">

        <header className="mb-5">
          <h1 className="font-script text-4xl">Tabungan Berdua 💰</h1>
          <p className="text-sm text-muted-foreground">Nabung bareng untuk masa depan</p>
        </header>

        {/* Main saving card */}
        <div className="glass-pink gold-border rounded-3xl p-5 shadow-pink relative overflow-hidden">
          <Sparkles size={16} className="absolute top-3 right-3 text-yellow-400 anim-twinkle" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Tabungan</p>
          <p className="font-script text-5xl text-primary mt-1">{fmtIDR(totalSaved)}</p>
          <div className="mt-3 h-2.5 rounded-full bg-white/60 overflow-hidden">
            <div className="h-full bg-gradient-pink anim-shimmer" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-white text-primary font-bold flex items-center justify-center ring-2 ring-yellow-400/70 text-xs">
                {myInitial}
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-pink text-white font-bold flex items-center justify-center ring-2 ring-yellow-400/70 text-xs">
                {partnerInitial}
              </div>
            </div>
            <span>dari target <span className="font-bold text-primary">{fmtIDR(SAVING_GOAL)}</span></span>
          </div>
        </div>

        {/* Kontribusi */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="glass-pink rounded-2xl p-3 shadow-soft">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white text-primary font-bold flex items-center justify-center text-xs ring-2 ring-yellow-400/50">
                {myInitial}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{myName}</span>
            </div>
            <p className="font-script text-xl mt-1 text-primary">{fmtIDR(myContrib)}</p>
          </div>
          <div className="glass rounded-2xl p-3 shadow-soft border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-pink text-white font-bold flex items-center justify-center text-xs ring-2 ring-yellow-400/50">
                {partnerInitial}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{partnerName}</span>
            </div>
            <p className="font-script text-xl mt-1 text-primary">{fmtIDR(partnerContrib)}</p>
          </div>
        </div>

        {/* Riwayat */}
        <h2 className="font-script text-2xl mt-6 mb-3">Riwayat Tabungan 📖</h2>
        
        {!savings || savings.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-4xl mb-2">🏦</p>
            <p className="text-muted-foreground">Belum ada tabungan</p>
            <p className="text-xs text-muted-foreground mt-1">Tap tombol + untuk mulai nabung</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savings.map(s => {
              const isMine = s.added_by === user?.id
              const who = isMine ? myName : partnerName
              const initial = isMine ? myInitial : partnerInitial
              const positive = parseFloat(String(s.amount)) > 0
              const amount = Math.abs(parseFloat(String(s.amount)))
              
              return (
                <div key={s.id} className="glass rounded-2xl p-3 flex items-center gap-3 shadow-soft">
                  <div className={`h-10 w-10 rounded-full font-bold flex items-center justify-center text-sm ring-2 ring-yellow-400/50 ${
                    isMine ? 'bg-white text-primary' : 'bg-gradient-pink text-white'
                  }`}>
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.note || 'Tabungan'}</p>
                    <p className="text-[11px] text-muted-foreground">{who} • {new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-sm font-bold ${positive ? 'text-emerald-600' : 'text-primary'}`}>
                    {positive ? '+' : '−'} {fmtIDR(amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-30 h-14 w-14 rounded-full bg-gradient-pink text-white shadow-pink flex items-center justify-center"
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>

      </div>
      <BottomNav />
      <AddSavingSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}