import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook untuk fetch kategori user
 */
export function useCategories(scope = 'personal') {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['categories', user?.id, scope],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
      
      if (scope) {
        query = query.eq('scope', scope)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('❌ Error fetching categories:', error)
        throw error
      }
      
      console.log('✅ Categories loaded:', data?.length)
      return data || []
    },
  })
}

/**
 * Hook untuk menambah kategori
 */
export function useAddCategory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (category) => {
      console.log('💾 Adding category:', category)
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          owner_id: user.id,
          scope: 'personal',
          ...category,
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error adding category:', error)
        throw error
      }
      
      console.log('✅ Category added:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

/**
 * Hook untuk update kategori
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

/**
 * Hook untuk hapus kategori
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

/**
 * Hook untuk create default categories untuk user baru
 */
export function useCreateDefaultCategories() {
  const { user } = useAuth()
  
  const defaultCategories = [
    { name: 'Makanan & Minuman', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { name: 'Belanja', icon: '🛍️', color: '#FFE66D' },
    { name: 'Tagihan', icon: '📱', color: '#95E1D3' },
    { name: 'Hiburan', icon: '🎮', color: '#F38181' },
    { name: 'Kesehatan', icon: '💊', color: '#A8E6CF' },
    { name: 'Pendidikan', icon: '📚', color: '#FFAAA5' },
    { name: 'Lainnya', icon: '📦', color: '#B4A7D6' },
  ]
  
  return useMutation({
    mutationFn: async () => {
      const categories = defaultCategories.map(cat => ({
        ...cat,
        owner_id: user.id,
        scope: 'personal',
      }))
      
      const { data, error } = await supabase
        .from('categories')
        .insert(categories)
        .select()
      
      if (error) throw error
      return data
    },
  })
}
