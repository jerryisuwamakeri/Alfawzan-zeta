'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR, { useSWRConfig } from 'swr'
import { Plus, Trash2, BookOpen, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, EmptyState, PageLoader, Pagination, Avatar } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import type { PaymentReference, PaginationMeta } from '@/types'

export default function PaymentReferencesPage() {
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState<number | null>(null)
  const { mutate } = useSWRConfig()

  const key = `/admin/payment-references?page=${page}`
  const { data, isLoading } = useSWR(key,
    () => api.get<{ data: PaymentReference[]; meta: PaginationMeta }>('/admin/payment-references', { page: String(page) })
  )

  async function changeStatus(id: number, status: string) {
    setUpdating(id)
    try {
      await api.patch(`/admin/payment-references/${id}/status`, { status })
      mutate(key)
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  async function deleteRef(id: number) {
    if (!confirm('Delete this payment reference?')) return
    try {
      await api.delete(`/admin/payment-references/${id}`)
      mutate(key)
    } catch (err: unknown) {
      alert((err as Error).message || 'Cannot delete this reference.')
    }
  }

  return (
    <DashboardLayout title="Payment References" requiredRole="admin">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h2 className="page-title">Payment References</h2>
            <p className="page-subtitle">Generate and manage reference IDs for student payments</p>
          </div>
          <Link href="/admin/payment-references/new" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Generate Reference
          </Link>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title="No references yet"
              description="Generate your first reference ID to get started."
              action={
                <Link href="/admin/payment-references/new" className="btn btn-primary btn-sm">
                  <Plus className="h-3.5 w-3.5" /> Generate
                </Link>
              }
            />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference ID</th>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Created By</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <code
                          className="rounded px-2 py-0.5 text-xs font-mono"
                          style={{ background: 'var(--surface-3)', color: 'var(--text)' }}
                        >
                          {r.reference_id}
                        </code>
                      </td>
                      <td>
                        {r.user ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={r.user.name} size="sm" />
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.user.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{r.user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--text-3)' }}>Any student</span>
                        )}
                      </td>
                      <td className="font-semibold" style={{ color: '#6ee7b7' }}>{formatCurrency(r.amount)}</td>

                      {/* Inline status changer */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          {updating === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--text-3)' }} />
                          ) : (
                            <select
                              value={r.status}
                              onChange={(e) => changeStatus(r.id, e.target.value)}
                              className="input py-1 text-xs w-32"
                              style={{ height: 28 }}
                            >
                              <option value="pending">Pending</option>
                              <option value="used">Paid / Used</option>
                              <option value="expired">Expired</option>
                            </select>
                          )}
                        </div>
                      </td>

                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {r.expires_at ? formatDate(r.expires_at) : 'Never'}
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-2)' }}>{r.creator?.name ?? '—'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => deleteRef(r.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#fca5a5' }}
                          title="Delete reference"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.meta && (
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
