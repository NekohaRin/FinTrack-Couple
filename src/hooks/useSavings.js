import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useCouple } from './useCouple'

/**
 * Hook untuk fetch semua savings untuk couple
 */
export function useSavings() {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  return useQuery({
    queryKey: ['savings', couple?.id],
    enabled: !!user && !!couple?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings')
        .select(`
          *,
          added_by_profile:profiles!savings_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .eq('couple_id', couple.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching savings:', error)
        throw error
      }
      
      console.log('✅ Savings loaded:', data?.length)
      return data || []
    },
  })
}

/**
 * Hook untuk fetch total savings couple
 */
export function useSavingsSummary() {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  return useQuery({
    queryKey: ['savings-summary', couple?.id],
    enabled: !!user && !!couple?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings')
        .select('amount')
        .eq('couple_id', couple.id)
      
      if (error) throw error
      
      const total = data.reduce((sum, s) => sum + parseFloat(s.amount), 0)
      
      console.log('✅ Total savings:', total)
      return { total, count: data.length }
    },
  })
}

/**
 * Hook untuk menambah saving
 */
export function useAddSaving() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  return useMutation({
    mutationFn: async (saving) => {
      if (!couple?.id) throw new Error('Couple not found')
      
      console.log('💾 Adding saving:', saving)
      
      const { data, error } = await supabase
        .from('savings')
        .insert({
          couple_id: couple.id,
          added_by: user.id,
          ...saving,
        })
        .select(`
          *,
          added_by_profile:profiles!savings_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .single()
      
      if (error) {
        console.error('❌ Error adding saving:', error)
        throw error
      }
      
      console.log('✅ Saving added:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      queryClient.invalidateQueries({ queryKey: ['savings-summary'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-item'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-savings'] })
    },
  })
}

/**
 * Hook untuk update saving
 */
export function useUpdateSaving() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('savings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          added_by_profile:profiles!savings_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      queryClient.invalidateQueries({ queryKey: ['savings-summary'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-item'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-savings'] })
    },
  })
}

/**
 * Hook untuk hapus saving
 */
export function useDeleteSaving() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      queryClient.invalidateQueries({ queryKey: ['savings-summary'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-item'] })
    },
  })
}

/**
 * Hook untuk fetch savings untuk wishlist item tertentu
 */
export function useWishlistSavings(wishlistItemId) {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  return useQuery({
    queryKey: ['wishlist-savings', wishlistItemId],
    enabled: !!user && !!couple?.id && !!wishlistItemId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings')
        .select(`
          *,
          added_by_profile:profiles!savings_added_by_fkey(user_id, display_name, avatar_url)
        `)
        .eq('wishlist_item_id', wishlistItemId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching wishlist savings:', error)
        throw error
      }
      
      console.log(`✅ Wishlist savings loaded (${wishlistItemId}):`, data?.length)
      return data || []
    },
  })
}
