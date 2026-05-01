'use client'

import { cn } from '@/lib/utils'

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span className={cn('badge', color ?? 'bg-white/5 text-white/50')}>
      {label}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size]
  return (
    <div
      className={cn('animate-spin rounded-full border-2', s)}
      style={{ borderColor: 'var(--border-md)', borderTopColor: '#6366f1' }}
    />
  )
}

// ─── PageLoader ───────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex h-48 items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
      >
        {icon}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{title}</p>
      {description && (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
const palette: Record<string, { bg: string; color: string }> = {
  primary: { bg: 'rgba(99,102,241,0.12)',  color: '#a5b4fc' },
  emerald: { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7' },
  amber:   { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d' },
  sky:     { bg: 'rgba(14,165,233,0.12)',  color: '#7dd3fc' },
  violet:  { bg: 'rgba(139,92,246,0.12)',  color: '#c4b5fd' },
}

export function StatCard({
  label,
  value,
  icon,
  color = 'primary',
  sub,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: 'primary' | 'emerald' | 'amber' | 'sky' | 'violet'
  sub?: string
}) {
  const { bg, color: iconColor } = palette[color]

  return (
    <div className="stat-card flex items-start gap-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: bg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{label}</p>
        <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--text)' }}>{value}</p>
        {sub && <p className="mt-0.5 text-xs" style={{ color: 'var(--text-3)' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  const s = { sm: 'h-7 w-7 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-10 w-10 text-base' }[size]
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-medium', s)}
      style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
    >
      {initials}
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({
  type = 'info',
  message,
}: {
  type?: 'info' | 'success' | 'error' | 'warning'
  message: string
}) {
  const cls = { info: 'alert-info', success: 'alert-success', error: 'alert-error', warning: 'alert-warning' }[type]
  return <div className={cls}>{message}</div>
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number
  lastPage: number
  onPageChange: (p: number) => void
}) {
  if (lastPage <= 1) return null
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <p className="text-xs" style={{ color: 'var(--text-3)' }}>
        Page {currentPage} of {lastPage}
      </p>
      <div className="flex gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="btn btn-secondary btn-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="btn btn-secondary btn-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
