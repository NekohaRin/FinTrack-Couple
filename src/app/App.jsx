import { useEffect } from 'react'
import { QueryProvider } from './QueryProvider'
import { Router } from './Router'
import { supabase } from '../lib/supabase'
import { NotificationToast } from '../components/NotificationToast'
import { FloatingDecor, Blobs } from '../components/Decor'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'
import { useOfflineSync } from '../hooks/useOfflineSync'

function ThemeApplier() {
  useEffect(() => {
    async function applyTheme() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('theme_color')
        .eq('user_id', user.id)
        .single()
      if (profile?.theme_color) {
        document.body.classList.add(profile.theme_color)
      }
    }
    applyTheme()
  }, [])
  return null
}

function OfflineBanner() {
  const { isOnline, pendingCount, syncing } = useOfflineSync()
  if (isOnline && pendingCount === 0) return null
  return (
    <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[199] px-4 py-2 text-center text-xs font-semibold ${
      isOnline ? 'bg-emerald-400 text-white' : 'bg-amber-400 text-white'
    }`}>
      {!isOnline && '📵 Offline — transaksi akan disimpan lokal'}
      {isOnline && pendingCount > 0 && (syncing ? '🔄 Menyinkronkan data...' : `✅ ${pendingCount} transaksi berhasil disync`)}
    </div>
  )
}

function AppContent() {
  useRealtimeNotifications()
  return <Router />
}

function App() {
  return (
    <QueryProvider>
      <ThemeApplier />
      {/* Background global — muncul di semua halaman */}
      <Blobs />
      <FloatingDecor />
      <NotificationToast />
      <OfflineBanner />
      <AppContent />
    </QueryProvider>
  )
}

export default App