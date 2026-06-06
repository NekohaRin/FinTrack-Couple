import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useCouple } from './useCouple'
import { queryClient } from '../lib/queryClient'
import { triggerNotif } from '../components/NotificationToast'

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const { data: couple } = useCouple()

  useEffect(() => {
    if (!user || !couple?.id) return

    const partnerId = couple.user1_id === user.id
      ? couple.user2_id
      : couple.user1_id

    const partnerName = couple.user1_id === user.id
      ? couple.user2?.display_name || 'Pasangan'
      : couple.user1?.display_name || 'Pasangan'

    // Subscribe transaksi baru dari pasangan
    const txChannel = supabase
      .channel('partner-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${partnerId}`,
        },
        async (payload) => {   // ← tambah async di sini
          const tx = payload.new
          const isIncome = parseFloat(tx.amount) > 0

          triggerNotif({
            emoji: isIncome ? '💚' : '🌸',
            message: `${partnerName} mencatat ${isIncome ? 'pemasukan' : 'pengeluaran'} baru`,
          })

          // Push notification
          await supabase.functions.invoke('send-push-notification', {
            body: {
              userId: user.id,
              title: 'FinTrack 💕',
              body: `${partnerName} mencatat ${isIncome ? 'pemasukan' : 'pengeluaran'} baru`,
              url: '/',
            },
          })

          queryClient.invalidateQueries({ queryKey: ['partner-transactions'] })
        }
      )
      .subscribe()

    // Subscribe tabungan baru dari pasangan
    const savingChannel = supabase
      .channel('partner-savings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'savings',
          filter: `couple_id=eq.${couple.id}`,
        },
        async (payload) => {
          const saving = payload.new
          if (saving.added_by === user.id) return

          const amount = parseFloat(saving.amount)
          const isAdd = amount > 0

          triggerNotif({
            emoji: '💰',
            message: `${partnerName} ${isAdd ? 'menambah' : 'menarik'} tabungan bersama`,
          })

          await supabase.functions.invoke('send-push-notification', {
            body: {
              userId: user.id,
              title: 'FinTrack 💕',
              body: `${partnerName} ${isAdd ? 'menambah' : 'menarik'} tabungan bersama`,
              url: '/tabungan',
            },
          })

          queryClient.invalidateQueries({ queryKey: ['savings'] })
          queryClient.invalidateQueries({ queryKey: ['savings-summary'] })
        }
      )
      .subscribe()

    // Subscribe wishlist baru
    const wishChannel = supabase
      .channel('couple-wishlist')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wishlist_items',
          filter: `couple_id=eq.${couple.id}`,
        },
        async (payload) => {
          const item = payload.new
          if (item.added_by === user.id) return

          triggerNotif({
            emoji: item.emoji || '⭐',
            message: `${partnerName} menambah impian baru: ${item.title}`,
          })

          await supabase.functions.invoke('send-push-notification', {
            body: {
              userId: user.id,
              title: 'FinTrack 💕',
              body: `${partnerName} menambah impian baru: ${item.title}`,
              url: '/wishlist',
            },
          })

          queryClient.invalidateQueries({ queryKey: ['wishlist'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(txChannel)
      supabase.removeChannel(savingChannel)
      supabase.removeChannel(wishChannel)
    }
  }, [user?.id, couple?.id])
}