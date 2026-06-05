import { useEffect } from 'react'
import { QueryProvider } from './QueryProvider'
import { Router } from './Router'
import { supabase } from '../lib/supabase'
import { NotificationToast } from '../components/NotificationToast'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'

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

// Komponen terpisah agar bisa pakai hooks
function AppContent() {
  useRealtimeNotifications()
  return <Router />
}

function App() {
  return (
    <QueryProvider>
      <ThemeApplier />
      <NotificationToast />
      <AppContent />
    </QueryProvider>
  )
}

export default App