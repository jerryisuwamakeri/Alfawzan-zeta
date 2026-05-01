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

export default function NewAgentLinkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ agent_id: '', name: '', description: '', is_active: true })

  const { data: agentsData } = useSWR('/admin/agent-links/agents', () =>
    api.get<{ data: User[] }>('/admin/agent-links/agents')
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
      await api.post('/admin/agent-links', {
        agent_id: form.agent_id || undefined,
        name: form.name,
        description: form.description || undefined,
        is_active: form.is_active,
      })
      router.push('/admin/agent-links')
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) flat[k] = v[0]
        setFieldErrors(flat)
      } else {
        setError(apiErr.message || 'Failed to create agent link.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Create Agent Link" requiredRole="admin">
      <div className="mx-auto max-w-lg">
        <Link href="/admin/agent-links" className="inline-flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--text-2)' }}>
          <ArrowLeft className="h-4 w-4" /> Back to agent links
        </Link>
        <div className="page-header mt-3 mb-5">
          <h2 className="page-title">Create Agent Link</h2>
          <p className="page-subtitle">Generate a unique payment tracking link for an agent</p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="mb-5"><Alert type="error" message={error} /></div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="name">Link Name *</label>
                <input id="name" className={`input ${fieldErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Q1 2025 Campaign" required value={form.name} onChange={set('name')} />
                {fieldErrors.name && <p className="error-text">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="agent_id">Assign to Agent (optional)</label>
                <select id="agent_id" className="input" value={form.agent_id} onChange={set('agent_id')}>
                  <option value="">No agent assigned</option>
                  {agentsData?.data.map((a: User) => (
                    <option key={a.id} value={a.id}>{a.name} — {a.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" className="input" rows={3}
                  placeholder="Optional notes about this link"
                  value={form.description} onChange={set('description')} />
              </div>
              <div className="flex items-center gap-2.5">
                <input id="is_active" type="checkbox" className="h-4 w-4 rounded"
                  style={{ accentColor: '#6366f1' }}
                  checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="is_active" className="text-sm" style={{ color: 'var(--text-2)' }}>Active (link accepts payments)</label>
              </div>
              <div className="flex gap-3 pt-1">
                <Link href="/admin/agent-links" className="btn btn-secondary flex-1">Cancel</Link>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
