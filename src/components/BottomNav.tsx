import { Link, useLocation } from 'react-router-dom'
import { Home, HeartHandshake, PiggyBank, Star, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Beranda', Icon: Home },
  { to: '/partner', label: 'Pasangan', Icon: HeartHandshake },
  { to: '/tabungan', label: 'Tabungan', Icon: PiggyBank },
  { to: '/wishlist', label: 'Wishlist', Icon: Star },
  { to: '/settings', label: 'Profil', Icon: User },
] as const

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[406px]">
      <div className="glass rounded-3xl shadow-pink px-2 py-2 flex items-center justify-between">
        {tabs.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all"
            >
              <div className={`flex items-center justify-center h-9 w-9 rounded-2xl transition-all ${
                active ? 'bg-gradient-pink text-white shadow-pink' : 'text-foreground/55'
              }`}>
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${
                active ? 'text-primary' : 'text-foreground/50'
              }`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}