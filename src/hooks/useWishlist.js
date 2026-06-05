import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useCouple } from './useCouple'

/**
 * Hook untuk fetch semua wishlist items
 */
export function useWishlist() {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  return useQuery({
    queryKey: ['wishlist', couple?.id],
    enabled: !!user && !!couple?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          added_by_profile:profiles!wishlist_items_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching wishlist:', error)
        throw error
      }
      
      console.log('✅ Wishlist loaded:', data?.length)
      return data || []
    },
  })
}

/**
 * Hook untuk fetch single wishlist item by ID
 */
export function useWishlistItem(id) {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  return useQuery({
    queryKey: ['wishlist-item', id],
    enabled: !!user && !!couple?.id && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          added_by_profile:profiles!wishlist_items_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .eq('id', id)
        .eq('couple_id', couple.id)
        .single()
      
      if (error) {
        console.error('❌ Error fetching wishlist item:', error)
        throw error
      }
      
      console.log('✅ Wishlist item loaded:', data)
      return data
    },
  })
}

/**
 * Hook untuk menambah wishlist item
 */
export function useAddWishlistItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  return useMutation({
    mutationFn: async (item) => {
      if (!couple?.id) throw new Error('Couple not found')
      
      console.log('💾 Adding wishlist item:', item)
      
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          couple_id: couple.id,
          added_by: user.id,
          saved_amount: 0,
          priority_votes: 0,
          status: 'active',
          ...item,
        })
        .select(`
          *,
          added_by_profile:profiles!wishlist_items_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .single()
      
      if (error) {
        console.error('❌ Error adding wishlist item:', error)
        throw error
      }
      
      console.log('✅ Wishlist item added:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

/**
 * Hook untuk update wishlist item
 */
export function useUpdateWishlistItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          added_by_profile:profiles!wishlist_items_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-item', data.id] })
    },
  })
}

/**
 * Hook untuk hapus wishlist item
 */
export function useDeleteWishlistItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

/**
 * Hook untuk toggle vote wishlist item
 */
export function useToggleWishlistVote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, currentVotes }) => {
      // Increment vote
      const { data, error } = await supabase
        .from('wishlist_items')
        .update({ priority_votes: currentVotes + 1 })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-item', data.id] })
    },
  })
}

/**
 * Hook untuk mark wishlist as achieved
 */
export function useMarkWishlistAchieved() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .update({ status: 'achieved' })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-item', data.id] })
    },
  })
}
