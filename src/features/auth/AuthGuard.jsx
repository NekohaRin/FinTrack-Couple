import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCouple } from '../../hooks/useCouple'
import { useEffect, useState } from 'react'
import { ensureProfileExists } from '../../lib/createProfileIfMissing'

export function AuthGuard({ children, requireCouple = true }) {
  const { user, loading: authLoading } = useAuth()
  const { data: couple, isLoading: coupleLoading } = useCouple()
  const [profileChecked, setProfileChecked] = useState(false)

  // Safety check: pastikan profile ada setelah user login
  useEffect(() => {
    if (user && !profileChecked) {
      ensureProfileExists()
        .then(() => {
          setProfileChecked(true)
        })
        .catch((error) => {
          console.error('❌ Profile check failed:', error)
          setProfileChecked(true) // Tetap lanjut meski gagal
        })
    }
  }, [user, profileChecked])

  // Tunggu sampai auth & profile check selesai
  if (authLoading || (user && (!profileChecked || coupleLoading))) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#FFF5F9' }}>
        <p className="font-script text-2xl text-primary">Loading... 💕</p>
      </div>
    )
  }

  // Belum login → ke halaman login
  if (!user) return <Navigate to="/login" replace />

  // Sudah login tapi belum punya pasangan → ke onboarding
  // Kecuali halaman yang memang tidak butuh couple (onboarding itu sendiri)
  if (requireCouple && !couple) return <Navigate to="/onboarding" replace />

  return children
}