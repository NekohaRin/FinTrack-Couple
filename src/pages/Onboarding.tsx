import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Copy, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { createInvite, joinWithCode, getExistingInvite } from '../features/auth/inviteCouple'
import { queryClient } from '../lib/queryClient'
import { useEffect } from 'react'
import { useCouple } from '../hooks/useCouple'

export default function Onboarding() {
  const [step, setStep] = useState<'pick' | 'code' | 'join'>('pick')
  const [code, setCode] = useState('')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { data: couple } = useCouple()
  const nav = useNavigate()

  useEffect(() => {
    if (couple) nav('/')
  }, [couple])

  useEffect(() => {
    if (!user) return
    getExistingInvite(user.id).then(data => {
      if (data) { setCode(data.invite_code); setStep('code') }
    })
  }, [user])

  const copy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function handleCreate() {
    if (!user) return
    setLoading(true); setError(null)
    try {
      const data = await createInvite(user.id)
      setCode(data.invite_code); setStep('code')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleJoin() {
    if (!user || input.length < 6) return
    setLoading(true); setError(null)
    try {
      await joinWithCode(user.id, input)
      queryClient.invalidateQueries({ queryKey: ['couple'] })
      nav('/')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen px-5 pt-8 pb-10 relative overflow-hidden" style={{ background: '#FFF5F9' }}>

      {step !== 'pick' && (
        <button onClick={() => setStep('pick')} className="mb-2 inline-flex items-center gap-1 text-sm text-primary font-semibold">
          <ArrowLeft size={14} /> kembali
        </button>
      )}

      <div className="text-center pt-6">
        <h1 className="font-script text-4xl">Hubungkan Pasangan 💕</h1>
        <p className="text-sm text-muted-foreground mt-1">Satu langkah lagi untuk mulai bersama</p>
      </div>

      {step === 'pick' && (
        <div className="mt-8 space-y-4">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-pink text-white p-5 text-left shadow-pink flex items-center gap-4 disabled:opacity-50"
          >
            <div className="h-12 w-12 rounded-2xl bg-white/25 flex items-center justify-center">
              <Heart size={22} fill="currentColor" />
            </div>
            <div>
              <div className="font-bold">Buat Kode Invite</div>
              <div className="text-xs opacity-90">Bagikan ke pasanganmu 💌</div>
            </div>
          </button>

          <button
            onClick={() => setStep('join')}
            className="w-full rounded-3xl glass p-5 text-left shadow-soft flex items-center gap-4 gold-border"
          >
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl">✨</div>
            <div>
              <div className="font-bold">Punya Kode Invite</div>
              <div className="text-xs text-muted-foreground">Masukkan kode dari pasangan</div>
            </div>
          </button>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        </div>
      )}

      {step === 'code' && code && (
        <div className="mt-8 flex flex-col items-center">
          <div className="relative rounded-3xl bg-pink-50 gold-border p-8 shadow-pink">
            <span className="absolute -top-3 -left-3 text-2xl anim-float">♡</span>
            <span className="absolute -top-2 -right-2 text-yellow-400 anim-twinkle">✦</span>
            <span className="absolute -bottom-2 -left-2 text-yellow-400 anim-twinkle">✧</span>
            <span className="absolute -bottom-3 -right-3 text-2xl anim-float" style={{ animationDelay: '0.7s' }}>♡</span>
            <p className="text-xs text-center uppercase tracking-widest text-muted-foreground">Kode Invitemu</p>
            <p className="font-script text-6xl tracking-widest text-primary mt-2">{code}</p>
          </div>

          <button onClick={copy} className="mt-6 px-6 py-3 rounded-full bg-gradient-pink text-white font-semibold shadow-pink inline-flex items-center gap-2">
            <Copy size={16} />
            {copied ? 'Tersalin 💕' : 'Salin kode 💌'}
          </button>

          <p className="mt-6 text-sm text-muted-foreground">Menunggu pasangan bergabung...</p>

          <button onClick={() => nav('/')} className="mt-3 text-xs text-primary font-semibold">
            Lewati untuk sekarang →
          </button>
        </div>
      )}

      {step === 'join' && (
        <div className="mt-8 flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-3">Masukkan kode 6 karakter dari pasanganmu</p>
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="✦ ✦ ✦ ✦ ✦ ✦"
            className="w-64 text-center font-script text-4xl tracking-[0.4em] bg-white/70 gold-border rounded-3xl py-5 outline-none focus:ring-2 focus:ring-primary placeholder:text-primary/30"
          />
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          <button
            onClick={handleJoin}
            disabled={loading || input.length < 6}
            className="mt-6 w-64 py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink disabled:opacity-50"
          >
            {loading ? 'Menghubungkan...' : 'Hubungkan 💕'}
          </button>
        </div>
      )}
    </div>
  )
}