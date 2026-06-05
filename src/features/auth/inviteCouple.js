import { supabase } from '../../lib/supabase'

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createInvite(userId) {
  const invite_code = generateInviteCode()
  console.log('🎫 Creating invite code:', { userId, invite_code })
  
  const { data, error } = await supabase
    .from('couples')
    .insert({ user1_id: userId, invite_code, status: 'pending' })
    .select()
    .single()
  
  if (error) {
    console.error('❌ Create invite error:', error)
    throw error
  }
  
  console.log('✅ Invite created successfully:', data)
  return data
}

export async function joinWithCode(userId, code) {
  console.log('🔍 joinWithCode called:', { userId, code: code.toUpperCase() })
  
  // Query untuk cari invite code
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .eq('status', 'pending')
    .single()
  
  console.log('📊 Query result:', { couple, findError })
  
  if (findError) {
    console.error('❌ Find error:', findError)
    // Jika error adalah "not found", berikan pesan yang jelas
    if (findError.code === 'PGRST116') {
      throw new Error('Kode invite tidak ditemukan atau sudah dipakai.')
    }
    throw findError
  }
  
  if (!couple) {
    console.error('❌ Couple not found')
    throw new Error('Kode invite tidak ditemukan atau sudah dipakai.')
  }
  
  console.log('✅ Couple found:', couple)
  
  // Cek apakah ini invite milik sendiri
  if (couple.user1_id === userId) {
    console.error('❌ Cannot join own invite')
    throw new Error('Tidak bisa join invite milik sendiri.')
  }
  
  // Update couple dengan user2_id
  console.log('🔄 Updating couple with user2_id:', userId)
  const { data, error: updateError } = await supabase
    .from('couples')
    .update({ 
      user2_id: userId, 
      status: 'active', 
      linked_at: new Date().toISOString() 
    })
    .eq('id', couple.id)
    .select()
    .single()
  
  if (updateError) {
    console.error('❌ Update error:', updateError)
    throw updateError
  }
  
  console.log('✅ Couple updated successfully:', data)
  return data
}

export async function getExistingInvite(userId) {
  const { data } = await supabase
    .from('couples')
    .select('*')
    .eq('user1_id', userId)
    .eq('status', 'pending')
    .maybeSingle()
  return data
}