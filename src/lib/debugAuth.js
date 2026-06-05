// Script debug untuk memeriksa masalah autentikasi
import { supabase } from './supabase'

export async function debugAuth() {
  console.group('🔍 Debug Autentikasi Supabase')
  
  // 1. Cek konfigurasi
  console.log('1️⃣ Konfigurasi Supabase:')
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('Anon Key (20 char):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
  
  // 2. Cek session saat ini
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  console.log('\n2️⃣ Session saat ini:')
  if (sessionError) {
    console.error('❌ Error saat cek session:', sessionError)
  } else {
    console.log('Session:', sessionData.session ? '✅ Ada' : '❌ Tidak ada')
    if (sessionData.session) {
      console.log('User ID:', sessionData.session.user.id)
      console.log('Email:', sessionData.session.user.email)
    }
  }
  
  // 3. Cek profile di database
  if (sessionData.session) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', sessionData.session.user.id)
      .single()
    
    console.log('\n3️⃣ Profile di database:')
    if (profileError) {
      console.error('❌ Error cek profile:', profileError.message)
      console.log('💡 Kemungkinan: Profile belum dibuat otomatis')
    } else {
      console.log('✅ Profile ditemukan:', profile)
    }
    
    // 4. Cek couple
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${sessionData.session.user.id},user2_id.eq.${sessionData.session.user.id}`)
      .eq('status', 'active')
      .maybeSingle()
    
    console.log('\n4️⃣ Couple status:')
    if (coupleError) {
      console.error('❌ Error cek couple:', coupleError.message)
    } else {
      console.log('Couple:', couple ? '✅ Sudah terhubung' : '⚠️ Belum terhubung')
      if (couple) {
        console.log('Couple data:', couple)
      }
    }
  }
  
  console.groupEnd()
}
