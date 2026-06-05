import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from '../features/auth/AuthGuard'
import Login from '../pages/Login'
import Onboarding from '../pages/Onboarding'
import Dashboard from '../pages/Dashboard'
import PartnerView from '../pages/PartnerView'
import Tabungan from '../pages/Tabungan'
import Wishlist from '../pages/Wishlist'
import WishlistDetail from '../pages/WishlistDetail'
import Settings from '../pages/Settings'
import SettingsNotifications from '../pages/SettingsNotifications'
import SettingsPrivacy from '../pages/SettingsPrivacy'
import SettingsHelp from '../pages/SettingsHelp'

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<AuthGuard requireCouple={false}><Onboarding /></AuthGuard>} />
        <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/partner" element={<AuthGuard><PartnerView /></AuthGuard>} />
        <Route path="/tabungan" element={<AuthGuard><Tabungan /></AuthGuard>} />
        <Route path="/wishlist" element={<AuthGuard><Wishlist /></AuthGuard>} />
        <Route path="/wishlist/:id" element={<AuthGuard><WishlistDetail /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        <Route path="/settings/notifications" element={<AuthGuard><SettingsNotifications /></AuthGuard>} />
        <Route path="/settings/privacy" element={<AuthGuard><SettingsPrivacy /></AuthGuard>} />
        <Route path="/settings/help" element={<AuthGuard><SettingsHelp /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}