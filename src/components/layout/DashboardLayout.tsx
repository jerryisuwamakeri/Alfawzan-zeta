'use client'

import { useState } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { PageLoader } from '@/components/ui'
import AppSidebar from './AppSidebar'
import type { Role } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  requiredRole?: Role | Role[]
}

export default function DashboardLayout({ children, title, requiredRole }: DashboardLayoutProps) {
  const { user, isLoading, logout } = useAuth(true)
  const { theme, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <PageLoader />
      </div>
    )
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowed.includes(user.role as Role)) {
      return (
        <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--text)' }}>Access Denied</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>You don&apos;t have permission to view this page.</p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar — always in flex flow on desktop, fixed overlay on mobile ── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200',
          'md:static md:translate-x-0 md:z-auto md:shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          width: 240,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <AppSidebar
          role={user.role as Role}
          name={user.name}
          email={user.email}
          onLogout={logout}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className="flex h-14 shrink-0 items-center gap-3 px-4"
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center rounded"
            style={{ width: 32, height: 32, color: 'var(--text-2)' }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="flex-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h1>

          <button
            onClick={toggle}
            className="flex items-center justify-center rounded transition-colors"
            style={{ width: 32, height: 32, color: 'var(--text-2)' }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
