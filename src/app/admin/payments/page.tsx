'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Eye, CreditCard } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Avatar, Badge, EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import type { Payment, PaginationMeta } from '@/types'

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const params: Record<string, string> = { page: String(page) }
  if (statusFilter) params.status = statusFilter

  const { data, isLoading } = useSWR(
    `/admin/payments?page=${page}&status=${statusFilter}`,
    () => api.get<{ data: Payment[]; meta: PaginationMeta }>('/admin/payments', params)
  )

  return (
    <DashboardLayout title="All Payments" requiredRole="admin">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h2 className="page-title">All Payments</h2>
            <p className="page-subtitle">Complete transaction history across all students</p>
          </div>
          <select
            className="input w-auto text-sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState icon={<CreditCard className="h-8 w-8" />} title="No payments found" />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={p.user!.name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-white">{p.user!.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{p.user!.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code
                          className="rounded px-2 py-0.5 text-xs font-mono"
                          style={{ background: 'var(--surface-3)', color: 'var(--text)' }}
                        >
                          {p.payment_reference.slice(0, 16)}
                        </code>
                      </td>
                      <td className="font-semibold" style={{ color: '#6ee7b7' }}>{formatCurrency(p.amount)}</td>
                      <td className="capitalize text-sm" style={{ color: 'var(--text-2)' }}>{p.payment_method}</td>
                      <td><Badge label={p.status} color={statusColor(p.status)} /></td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(p.created_at)}</td>
                      <td className="text-right">
                        <button className="btn btn-secondary btn-sm"><Eye className="h-3.5 w-3.5" /></button>
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
