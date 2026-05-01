'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { CreditCard, DollarSign, Receipt, Plus, ArrowRight, Eye } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, PageLoader, EmptyState, Badge } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'

interface DashboardData {
  stats: { total_payments: number; total_spent: number; total_receipts: number }
  recent_payments: Array<{ id: number; payment_reference: string; amount: string; status: string; created_at: string }>
  recent_receipts: Array<{ id: number; receipt_number: string; amount: string; generated_at: string }>
}

export default function UserDashboard() {
  const { data, isLoading } = useSWR('/user/dashboard', () => api.get<DashboardData>('/user/dashboard'))

  return (
    <DashboardLayout title="Dashboard" requiredRole="user">
      {isLoading || !data ? (
        <PageLoader />
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Payments" value={data.stats.total_payments} icon={<CreditCard className="h-6 w-6" />} color="primary" sub="All transactions" />
            <StatCard label="Total Spent" value={formatCurrency(data.stats.total_spent)} icon={<DollarSign className="h-6 w-6" />} color="emerald" sub="Successful payments" />
            <StatCard label="Receipts" value={data.stats.total_receipts} icon={<Receipt className="h-6 w-6" />} color="sky" sub="Available receipts" />
          </div>

          <div className="grid gap-6 lg:grid-cols-7">
            {/* Recent Payments */}
            <div className="lg:col-span-4">
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white">Recent Payments</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Your latest transactions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/payments/new" className="btn btn-primary btn-sm">
                      <Plus className="h-3.5 w-3.5" /> Pay
                    </Link>
                    <Link href="/payments" className="btn btn-secondary btn-sm">
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                {data.recent_payments.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard className="h-8 w-8" />}
                    title="No payments yet"
                    description="Make your first payment to get started."
                    action={<Link href="/payments/new" className="btn btn-primary btn-sm">Make Payment</Link>}
                  />
                ) : (
                  <div className="table-wrapper rounded-none border-x-0 border-b-0 shadow-none">
                    <table className="table">
                      <thead><tr><th>Reference</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr></thead>
                      <tbody>
                        {data.recent_payments.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <code
                                className="rounded px-2 py-0.5 text-xs font-mono"
                                style={{ background: 'var(--surface-3)', color: 'var(--text)' }}
                              >
                                {p.payment_reference.slice(0, 16)}
                              </code>
                            </td>
                            <td className="font-semibold" style={{ color: '#6ee7b7' }}>{formatCurrency(p.amount)}</td>
                            <td><Badge label={p.status} color={statusColor(p.status)} /></td>
                            <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(p.created_at)}</td>
                            <td>
                              <Link href={`/payments/${p.id}`} className="btn btn-ghost btn-sm">
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Receipts */}
            <div className="lg:col-span-3">
              <div className="card h-full">
                <div className="card-header flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white">Recent Receipts</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Latest downloads</p>
                  </div>
                  <Link href="/receipts" className="btn btn-secondary btn-sm">View all</Link>
                </div>
                {data.recent_receipts.length === 0 ? (
                  <EmptyState icon={<Receipt className="h-8 w-8" />} title="No receipts yet" />
                ) : (
                  <div>
                    {data.recent_receipts.map((r, i) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between px-5 py-3.5"
                        style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{r.receipt_number}</p>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(r.generated_at)}</p>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: '#6ee7b7' }}>{formatCurrency(r.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
