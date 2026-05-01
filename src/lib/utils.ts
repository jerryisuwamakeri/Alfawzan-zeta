import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function statusColor(status: string): string {
  switch (status) {
    case 'paid': case 'active': case 'used': case 'approved':
      return 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
    case 'pending':
      return 'bg-amber-900/40 text-amber-400 border border-amber-800/50'
    case 'failed': case 'expired': case 'inactive': case 'rejected':
      return 'bg-red-900/40 text-red-400 border border-red-800/50'
    default:
      return 'bg-white/10 text-white/60'
  }
}
