'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert } from '@/components/ui'
import { api } from '@/lib/api'
import type { User } from '@/types'

export default function NewPaymentReferencePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ user_id: '', amount: '', description: '', expires_at: '' })

  const { data: usersData } = useSWR('/admin/payment-references/users', () =>
    api.get<{ data: User[] }>('/admin/payment-references/users')
  )

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setFieldErrors((fe) => ({ ...fe, [field]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)
    try {
      await api.post('/admin/payment-references', {
        user_id: form.user_id || undefined,
        amount: parseFloat(form.amount),
        description: form.description || undefined,
        expires_at: form.expires_at || undefined,
      })
      router.push('/admin/payment-references')
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) flat[k] = v[0]
        setFieldErrors(flat)
      } else {
        setError(apiErr.message || 'Failed to generate reference.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Generate Reference" requiredRole="admin">
      <div className="mx-auto max-w-lg">
        <Link href="/admin/payment-references" className="inline-flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--text-2)' }}>
          <ArrowLeft className="h-4 w-4" /> Back to references
        </Link>
        <div className="page-header mt-3 mb-5">
          <h2 className="page-title">Generate Payment Reference</h2>
          <p className="page-subtitle">Create a reference ID that a student can use to pay</p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="mb-5"><Alert type="error" message={error} /></div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="user_id">Assign to Student (optional)</label>
                <select id="user_id" className="input" value={form.user_id} onChange={set('user_id')}>
                  <option value="">Any student</option>
                  {usersData?.data.map((u: User) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-3)' }}>Leave blank to allow any student to use this reference.</p>
              </div>
              <div>
                <label className="label" htmlFor="amount">Amount (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-3)' }}>₦</span>
                  <input id="amount" type="number" step="0.01" min="0" className={`input pl-8 ${fieldErrors.amount ? 'input-error' : ''}`}
                    placeholder="0.00" required value={form.amount} onChange={set('amount')} />
                </div>
                {fieldErrors.amount && <p className="error-text">{fieldErrors.amount}</p>}
              </div>
              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" className="input" rows={3} placeholder="e.g. Tuition fee for Q1 2025"
                  value={form.description} onChange={set('description')} />
              </div>
              <div>
                <label className="label" htmlFor="expires_at">Expiry Date (optional)</label>
                <input id="expires_at" type="datetime-local" className="input"
                  value={form.expires_at} onChange={set('expires_at')} />
              </div>
              <div className="flex gap-3 pt-1">
                <Link href="/admin/payment-references" className="btn btn-secondary flex-1">Cancel</Link>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
