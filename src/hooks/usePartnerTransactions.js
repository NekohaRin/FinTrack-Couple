import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useCouple } from './useCouple'

/**
 * Hook untuk fetch transaksi pasangan
 */
export function usePartnerTransactions() {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  // Tentukan partner ID
  const partnerId = couple?.user1_id === user?.id 
    ? couple?.user2_id 
    : couple?.user1_id
  
  return useQuery({
    queryKey: ['partner-transactions', partnerId],
    enabled: !!user && !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(id, name, icon, color),
          user:profiles!transactions_user_id_fkey(user_id, display_name, avatar_url)
        `)
        .eq('user_id', partnerId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching partner transactions:', error)
        throw error
      }
      
      console.log('✅ Partner transactions loaded:', data?.length)
      return data || []
    },
  })
}

/**
 * Hook untuk fetch summary transaksi pasangan bulan ini
 */
export function usePartnerSummary() {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  const partnerId = couple?.user1_id === user?.id 
    ? couple?.user2_id 
    : couple?.user1_id
  
  return useQuery({
    queryKey: ['partner-summary', partnerId],
    enabled: !!user && !!partnerId,
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
        .eq('user_id', partnerId)
        .gte('date', startStr)
        .lte('date', endStr)
      
      if (error) throw error
      
      // Calculate totals
      const income = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      const expense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      const balance = income - expense
      
      console.log('✅ Partner summary:', { income, expense, balance })
      
      return { income, expense, balance }
    },
  })
}

/**
 * Hook untuk fetch info pasangan
 */
export function usePartnerInfo() {
  const { user } = useAuth()
  const { data: couple } = useCouple()
  
  const partnerId = couple?.user1_id === user?.id 
    ? couple?.user2_id 
    : couple?.user1_id
  
  return useQuery({
    queryKey: ['partner-info', partnerId],
    enabled: !!user && !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', partnerId)
        .single()
      
      if (error) {
        console.error('❌ Error fetching partner info:', error)
        throw error
      }
      
      console.log('✅ Partner info loaded:', data)
      return data
    },
  })
}
