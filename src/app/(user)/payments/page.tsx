'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Plus, Eye, Receipt as ReceiptIcon, CreditCard } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import type { Payment, PaginationMeta } from '@/types'

export default function PaymentsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSWR(
    `/user/payments?page=${page}`,
    () => api.get<{ data: Payment[]; meta: PaginationMeta }>('/user/payments', { page: String(page) })
  )

  return (
    <DashboardLayout title="My Payments" requiredRole="user">
      <div className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h2 className="page-title">My Payments</h2>
            <p className="page-subtitle">Track all your payment transactions</p>
          </div>
          <Link href="/payments/new" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Make Payment
          </Link>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<CreditCard className="h-8 w-8" />}
              title="No payments yet"
              description="Make your first payment to get started."
              action={<Link href="/payments/new" className="btn btn-primary btn-sm">Make Payment</Link>}
            />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
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
                        <code
                          className="rounded px-2 py-0.5 text-xs font-mono"
                          style={{ background: 'var(--surface-3)', color: 'var(--text)' }}
                        >
                          {p.payment_reference}
                        </code>
                      </td>
                      <td className="font-semibold" style={{ color: '#6ee7b7' }}>{formatCurrency(p.amount)}</td>
                      <td className="capitalize" style={{ color: 'var(--text-2)' }}>{p.payment_method === 'reference' ? 'Reference ID' : 'Online'}</td>
                      <td>
                        <Badge
                          label={p.status === 'paid' ? 'Paid' : p.status === 'pending' ? 'Not Paid' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          color={statusColor(p.status)}
                        />
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(p.created_at)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/payments/${p.id}`} className="btn btn-secondary btn-sm">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          {p.receipt && (
                            <Link href="/receipts" className="btn btn-ghost btn-sm" style={{ color: '#6ee7b7' }} title="View Receipt">
                              <ReceiptIcon className="h-3.5 w-3.5" /> Receipt
                            </Link>
                          )}
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
