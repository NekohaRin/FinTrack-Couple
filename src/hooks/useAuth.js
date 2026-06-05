import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Hook ini dipakai di mana saja yang butuh tahu siapa user yang login
// Mengembalikan: { user, session, loading }
export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ambil session yang sudah ada (misal: user refresh halaman)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Dengarkan perubahan status auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Cleanup: hentikan listener saat komponen unmount
    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading }
}

// Login dengan Google — redirect ke Google, lalu kembali ke app
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  if (error) throw error
}

// Login dengan email + password
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    console.error('❌ signInWithEmail error:', error)
    throw error
  }
  
  console.log('✅ signInWithEmail success:', {
    userId: data.user?.id,
    email: data.user?.email,
    session: !!data.session
  })
  
  return data
}

// Daftar akun baru dengan email + password
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) {
    console.error('❌ signUp error:', error)
    throw error
  }
  
  console.log('✅ signUp success:', {
    userId: data.user?.id,
    email: data.user?.email,
    session: !!data.session,
    needsEmailConfirmation: !data.session && !!data.user
  })
  
  // Cek apakah profile sudah dibuat
  if (data.user) {
    setTimeout(async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('⚠️ Profile check error:', profileError.message)
        console.log('💡 Jalankan fix-auth-setup.sql untuk membuat trigger otomatis')
      } else {
        console.log('✅ Profile created successfully:', profile)
      }
    }, 1000)
  }
  
  return data
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
