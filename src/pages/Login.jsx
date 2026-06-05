import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle, signInWithEmail, signUp } from '../hooks/useAuth'
import { useAuth } from '../hooks/useAuth'
import { debugAuth } from '../lib/debugAuth'

export default function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  // Debug auth saat component mount (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      debugAuth()
    }
  }, [])

  // Redirect jika sudah login
  useEffect(() => {
    if (user) {
      console.log('✅ User sudah login, redirect...')
      navigate('/', { replace: true })
    }
  }, [user, navigate])

async function handleEmailSubmit(e) {
  e.preventDefault()
  setError(null)
  setInfo(null)
  setLoading(true)

  try {
    if (mode === 'login') {
      console.log('🔐 Mencoba login dengan:', email)
      const result = await signInWithEmail(email, password)
      console.log('✅ Login berhasil:', result)
      // Navigate akan terjadi otomatis via useEffect di atas
    } else {
      console.log('📝 Mencoba registrasi dengan:', email)
      const result = await signUp(email, password)
      console.log('✅ Registrasi berhasil:', result)
      
      // Cek apakah email confirmation dibutuhkan
      if (result.user && !result.session) {
        setInfo('Cek emailmu untuk verifikasi akun, lalu login.')
      } else {
        setInfo('Akun berhasil dibuat! Redirecting...')
      }
    }
  } catch (err) {
    console.error('❌ Error auth:', err)
    if (err.message.includes('Invalid login credentials')) {
      setError('Email atau password salah.')
    } else if (err.message.includes('User already registered')) {
      setError('Email ini sudah terdaftar. Silakan login.')
    } else if (err.message.includes('Email not confirmed')) {
      setError('Email belum diverifikasi. Cek inbox emailmu.')
    } else {
      setError(err.message)
    }
  } finally {
    setLoading(false)
  }
}

  async function handleGoogleLogin() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('Gagal login dengan Google. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-white">

      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">FinTrack</h1>
        <p className="mt-1 text-sm text-gray-500">Keuangan bersama, lebih mudah</p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => { setMode('login'); setError(null); setInfo(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Masuk
        </button>
        <button
          onClick={() => { setMode('register'); setError(null); setInfo(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Daftar
        </button>
      </div>

      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {info && <p className="text-sm text-green-600 text-center">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-500 text-white text-sm font-medium rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">atau</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Lanjutkan dengan Google
      </button>

    </div>
  )
}