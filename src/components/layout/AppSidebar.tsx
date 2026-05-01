'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CreditCard, FileText, Receipt, User,
  Link2, BookOpen, LogOut, Users, GraduationCap, Settings,
  Printer, Award, ClipboardList, X,
} from 'lucide-react'
import type { Role } from '@/types'

const userNav = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/application', label: 'Application', icon: ClipboardList },
  { href: '/payments',    label: 'Payments',    icon: CreditCard },
  { href: '/documents',   label: 'Documents',   icon: FileText },
  { href: '/receipts',    label: 'Receipts',    icon: Receipt },
  { href: '/profile',     label: 'Profile',     icon: User },
]

const adminNav = [
  { href: '/admin/dashboard',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/students',              label: 'Applications', icon: GraduationCap },
  { href: '/admin/payments',              label: 'Payments',     icon: CreditCard },
  { href: '/admin/payment-references',    label: 'References',   icon: BookOpen },
  { href: '/admin/receipts/generate',     label: 'Receipts',     icon: Printer },
  { href: '/admin/certificates/generate', label: 'Certificates', icon: Award },
  { href: '/admin/agent-links',           label: 'Agent Links',  icon: Link2 },
  { href: '/admin/documents',             label: 'Documents',    icon: FileText },
  { href: '/admin/users',                 label: 'Users',        icon: Users },
  { href: '/admin/profile',              label: 'My Profile',   icon: User },
  { href: '/admin/settings',              label: 'Settings',     icon: Settings },
]

const agentNav = [
  { href: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

function navForRole(role: Role) {
  if (role === 'admin') return adminNav
  if (role === 'agent') return agentNav
  return userNav
}

interface AppSidebarProps {
  role: Role
  name: string
  email: string
  onLogout: () => void
  onClose?: () => void
}

export default function AppSidebar({ role, name, email, onLogout, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const nav = navForRole(role)
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  function isActive(href: string) {
    const exact = ['/dashboard', '/admin/dashboard', '/agent/dashboard']
    return exact.includes(href) ? pathname === href : pathname.startsWith(href)
  }

  return (
    <div className="flex h-full flex-col" style={{ width: 240 }}>

      {/* Logo row */}
      <div
        className="flex h-14 shrink-0 items-center justify-between px-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div
            className="flex h-8 w-8 items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: '#6366f1', borderRadius: 6 }}
          >
            AF
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Alfawzan</p>
            <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-3)' }}>
              Driving School
            </p>
          </div>
        </Link>

        {/* Close — mobile only */}
        {onClose && (
          <button
            className="md:hidden flex items-center justify-center rounded"
            style={{ width: 28, height: 28, color: 'var(--text-3)' }}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Section label */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
          {role === 'admin' ? 'Administration' : role === 'agent' ? 'Agent Portal' : 'Student Portal'}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
              style={{
                borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
                paddingLeft: active ? 'calc(0.75rem - 2px)' : '0.75rem',
                color: active ? '#fff' : 'var(--text-2)',
                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                borderRadius: 0,
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? '#a5b4fc' : 'var(--text-3)' }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="p-3 space-y-1 shrink-0">
        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
          style={{ color: '#f87171', background: 'transparent', borderRadius: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  )
}
