import { supabase } from './supabase'

/**
 * Helper function untuk membuat profile jika belum ada
 * Digunakan sebagai fallback jika trigger database tidak jalan
 * 
 * @param {string} userId - User ID dari auth.users
 * @param {string} email - Email user
 * @returns {Promise<object>} Profile yang dibuat atau sudah ada
 */
export async function createProfileIfMissing(userId, email) {
  try {
    // Cek apakah profile sudah ada
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Jika ada error selain "not found", throw
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // Jika profile sudah ada, return
    if (existingProfile) {
      console.log('✅ Profile sudah ada:', existingProfile)
      return existingProfile
    }

    // Jika belum ada, buat baru
    console.log('⚠️ Profile tidak ditemukan, membuat baru...')
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        display_name: email.split('@')[0], // Gunakan bagian sebelum @ sebagai display_name
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Gagal membuat profile:', insertError)
      throw insertError
    }

    console.log('✅ Profile berhasil dibuat:', newProfile)
    return newProfile
  } catch (error) {
    console.error('❌ Error di createProfileIfMissing:', error)
    throw error
  }
}

/**
 * Utility untuk mengecek dan memperbaiki user yang tidak punya profile
 * Panggil ini setelah login berhasil sebagai safety check
 */
export async function ensureProfileExists() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('No user logged in')
      return null
    }

    return await createProfileIfMissing(user.id, user.email)
  } catch (error) {
    console.error('❌ Error di ensureProfileExists:', error)
    return null
  }
}
