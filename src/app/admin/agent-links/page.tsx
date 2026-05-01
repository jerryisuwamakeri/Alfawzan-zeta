'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR, { useSWRConfig } from 'swr'
import { Plus, Trash2, Pencil, ExternalLink, Link2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Avatar, Badge, EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { AgentLink, PaginationMeta } from '@/types'

export default function AgentLinksPage() {
  const [page, setPage] = useState(1)
  const { mutate } = useSWRConfig()

  const { data, isLoading } = useSWR(
    `/admin/agent-links?page=${page}`,
    () => api.get<{ data: AgentLink[]; meta: PaginationMeta }>('/admin/agent-links', { page: String(page) })
  )

  async function deleteLink(id: number) {
    if (!confirm('Delete this agent link?')) return
    await api.delete(`/admin/agent-links/${id}`)
    mutate(`/admin/agent-links?page=${page}`)
  }

  return (
    <DashboardLayout title="Agent Links" requiredRole="admin">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h2 className="page-title">Agent Links</h2>
            <p className="page-subtitle">Manage unique payment tracking links for agents</p>
          </div>
          <Link href="/admin/agent-links/new" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Create Link
          </Link>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Link2 className="h-8 w-8" />}
              title="No agent links yet"
              description="Create a link to assign payment tracking to an agent."
              action={<Link href="/admin/agent-links/new" className="btn btn-primary btn-sm"><Plus className="h-3.5 w-3.5" /> Create Link</Link>}
            />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Agent</th>
                    <th>Link</th>
                    <th>Status</th>
                    <th>Payments</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((l) => (
                    <tr key={l.id}>
                      <td className="font-semibold text-white">{l.name}</td>
                      <td>
                        {l.agent ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={l.agent.name} size="sm" />
                            <span className="text-sm text-white">{l.agent.name}</span>
                          </div>
                        ) : <span className="text-sm" style={{ color: 'var(--text-3)' }}>—</span>}
                      </td>
                      <td>
                        <a href={l.full_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs hover:underline"
                          style={{ color: '#a5b4fc' }}>
                          <ExternalLink className="h-3 w-3" />
                          {l.full_url.replace(/^https?:\/\//, '').slice(0, 40)}
                        </a>
                      </td>
                      <td>
                        <Badge
                          label={l.is_active ? 'Active' : 'Inactive'}
                          color={l.is_active
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                            : 'bg-red-900/40 text-red-400 border border-red-800/50'}
                        />
                      </td>
                      <td>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
                        >
                          {l.payments_count}
                        </span>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(l.created_at)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/agent-links/${l.id}/edit`} className="btn btn-ghost btn-sm" style={{ color: '#fcd34d' }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button onClick={() => deleteLink(l.id)} className="btn btn-ghost btn-sm" style={{ color: '#fca5a5' }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
