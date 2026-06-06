import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import {
  subscribePushNotification,
  unsubscribePushNotification,
  getPushSubscription,
} from '../lib/pushNotification'

export function usePushNotification() {
  const { user } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Cek status subscription saat mount
    getPushSubscription().then(sub => {
      setIsSubscribed(!!sub)
    })
  }, [])

  async function subscribe() {
    if (!user) return
    setLoading(true)
    try {
      const subscription = await subscribePushNotification()
      if (!subscription) return

      // Simpan subscription ke Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: subscription.toJSON(),
        })

      if (error) throw error
      setIsSubscribed(true)
      console.log('✅ Push notification aktif')
    } catch (err) {
      console.error('❌ Gagal subscribe push:', err)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    if (!user) return
    setLoading(true)
    try {
      await unsubscribePushNotification()

      // Hapus dari Supabase
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)

      setIsSubscribed(false)
    } catch (err) {
      console.error('❌ Gagal unsubscribe:', err)
    } finally {
      setLoading(false)
    }
  }

  return { isSubscribed, loading, subscribe, unsubscribe }
}