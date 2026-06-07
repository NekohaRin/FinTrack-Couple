import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from '../features/auth/AuthGuard'

// Lazy load semua halaman
const Login = lazy(() => import('../pages/Login'))
const Onboarding = lazy(() => import('../pages/Onboarding'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const PartnerView = lazy(() => import('../pages/PartnerView'))
const Tabungan = lazy(() => import('../pages/Tabungan'))
const Wishlist = lazy(() => import('../pages/Wishlist'))
const WishlistDetail = lazy(() => import('../pages/WishlistDetail'))
const Settings = lazy(() => import('../pages/Settings'))
const SettingsNotifications = lazy(() => import('../pages/SettingsNotifications'))
const SettingsPrivacy = lazy(() => import('../pages/SettingsPrivacy'))
const SettingsHelp = lazy(() => import('../pages/SettingsHelp'))

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF5F9' }}>
      <p className="font-script text-2xl text-primary animate-pulse">💕</p>
    </div>
  )
}

export function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<AuthGuard requireCouple={false}><Onboarding /></AuthGuard>} />
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/partner" element={<AuthGuard><PartnerView /></AuthGuard>} />
          <Route path="/tabungan" element={<AuthGuard><Tabungan /></AuthGuard>} />
          <Route path="/wishlist" element={<AuthGuard><Wishlist /></AuthGuard>} />
          <Route path="/wishlist/:id" element={<AuthGuard><WishlistDetail /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/settings/notifications" element={<AuthGuard requireCouple={false}><SettingsNotifications /></AuthGuard>} />
          <Route path="/settings/privacy" element={<AuthGuard requireCouple={false}><SettingsPrivacy /></AuthGuard>} />
          <Route path="/settings/help" element={<AuthGuard requireCouple={false}><SettingsHelp /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}