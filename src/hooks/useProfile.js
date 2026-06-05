import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook untuk fetch profile user yang sedang login
 */
export function useProfile() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        console.error('❌ Error fetching profile:', error)
        throw error
      }
      
      console.log('✅ Profile loaded:', data)
      return data
    },
  })
}

/**
 * Hook untuk update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (file) => {
      console.log('📸 Starting avatar upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id
      })

      // Nama file: userId/avatar.jpg
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      console.log('📤 Uploading to path:', path)

      // Upload ke Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw uploadError
      }

      console.log('✅ Upload success:', uploadData)

      // Ambil public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const publicUrl = urlData.publicUrl
      console.log('🔗 Public URL:', publicUrl)

      // Simpan URL ke tabel profiles
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile update error:', error)
        throw error
      }

      console.log('✅ Profile updated with avatar URL:', data)
      return data
    },
    onSuccess: (data) => {
      console.log('✅ Avatar upload complete!')
      // Invalidate semua query profile dan couple supaya data fresh
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['couple'] })
      // Refetch immediately untuk update UI
      queryClient.refetchQueries({ queryKey: ['profile', user.id] })
    },
    onError: (error) => {
      console.error('❌ Upload avatar failed:', error)
    }
  })
}