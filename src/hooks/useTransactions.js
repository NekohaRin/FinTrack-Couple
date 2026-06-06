import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook untuk fetch transaksi user
 */
export function useTransactions() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['transactions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching transactions:', error)
        throw error
      }
      
      console.log('✅ Transactions loaded:', data?.length)
      return data || []
    },
  })
}

/**
 * Hook untuk fetch transaksi dalam periode tertentu
 */
export function useTransactionsByPeriod(startDate, endDate) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['transactions', user?.id, startDate, endDate],
    enabled: !!user && !!startDate && !!endDate,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
      
      if (error) throw error
      return data || []
    },
  })
}

/**
 * Hook untuk menambah transaksi
 */
export function useAddTransaction() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (transaction) => {
      console.log('💾 Adding transaction:', transaction)
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          ...transaction,
        })
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .single()
      
      if (error) {
        console.error('❌ Error adding transaction:', error)
        throw error
      }
      
      console.log('✅ Transaction added:', data)
      return data
    },
    onSuccess: () => {
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

/**
 * Hook untuk update transaksi
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

/**
 * Hook untuk hapus transaksi
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

/**
 * Hook untuk fetch summary dashboard (total income & expense bulan ini)
 */
export function useDashboardSummary() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard-summary', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Tanggal awal dan akhir bulan ini
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const startStr = startOfMonth.toISOString().split('T')[0]
      const endStr = endOfMonth.toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr)
      
      if (error) throw error
      
      // Calculate totals
      const income = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      const expense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
      
      const balance = income - expense
      
      console.log('✅ Dashboard summary:', { income, expense, balance })
      
      return { income, expense, balance }
    },
  })
}
