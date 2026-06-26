import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/inventory', label: 'Inventory', icon: Package },
  { to: '/owner/customers', label: 'Customers', icon: Users },
  { to: '/owner/bills', label: 'Bills', icon: Receipt },
  { to: '/owner/reports', label: 'Reports', icon: BarChart3 },
]

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/owner/dashboard'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-secondary-200 hover:bg-white/10 hover:text-white'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary-foreground' : 'text-secondary-300')} />
              <span className="lg:group-data-[collapsed=true]:hidden">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/owner/login', { replace: true })
  }

  const SidebarBody = ({ onNavigate }) => (
    <div className="flex h-full flex-col bg-secondary-900 text-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
            <path d="M17.64 15 22 10.64" />
            <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h.86c.85 0 1.65.33 2.25.93l1.25 1.25" />
          </svg>
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold">Sri Manikanta</p>
          <p className="text-[11px] text-secondary-400">Owner Dashboard</p>
        </div>
      </div>

      {/* New bill quick action */}
      <div className="px-3 pt-4">
        <NavLink
          to="/owner/bills/new"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/15 px-3 py-2.5 text-sm font-semibold text-primary-100 transition-colors hover:bg-primary/25"
        >
          <PlusCircle className="h-4.5 w-4.5" /> New Bill
        </NavLink>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <NavItems onNavigate={onNavigate} />
      </div>

      {/* Footer / user + logout */}
      <div className="border-t border-white/10 p-3">
        {user?.email && (
          <div className="mb-2 truncate px-3 py-1 text-xs text-secondary-400" title={user.email}>
            {user.email}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-secondary-200 transition-colors hover:bg-danger/20 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop / tablet fixed sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">
        <div className="fixed inset-y-0 left-0 w-60">
          <SidebarBody />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-secondary-900 px-4 text-white md:hidden">
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Receipt className="h-4 w-4" />
          </span>
          Owner Dashboard
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 animate-slide-in-right">
            <div className="relative h-full">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-white hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarBody onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
