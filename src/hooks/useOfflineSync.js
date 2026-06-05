import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { syncPendingTransactions, getPendingCount } from '../lib/offlineQueue'

export function useOfflineSync() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  // Update pending count
  async function updatePendingCount() {
    const count = await getPendingCount()
    setPendingCount(count)
  }

  useEffect(() => {
    updatePendingCount()
  }, [])

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      // Auto sync saat kembali online
      if (user?.id) {
        setSyncing(true)
        syncPendingTransactions(user.id)
          .then(() => updatePendingCount())
          .finally(() => setSyncing(false))
      }
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user?.id])

  return { isOnline, pendingCount, syncing, updatePendingCount }
}