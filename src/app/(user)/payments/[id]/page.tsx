'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, PageLoader } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, statusColor } from '@/lib/utils'
import type { Payment } from '@/types'

const statusIcon = { paid: CheckCircle, failed: XCircle, pending: Clock }
const statusIconColor: Record<string, string> = { paid: '#6ee7b7', failed: '#fca5a5', pending: '#fcd34d' }

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useSWR(
    `/user/payments/${id}`,
    () => api.get<{ data: Payment }>(`/user/payments/${id}`)
  )

  const payment = data?.data

  return (
    <DashboardLayout title="Payment Details" requiredRole="user">
      <div className="mx-auto max-w-xl">
        <Link href="/payments" className="inline-flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--text-2)' }}>
          <ArrowLeft className="h-4 w-4" /> Back to payments
        </Link>

        {isLoading || !payment ? (
          <PageLoader />
        ) : (
          <div className="card">
            {/* Status header */}
            <div className="card-header flex items-center gap-4">
              {(() => {
                const Icon = statusIcon[payment.status] ?? Clock
                const col = statusIconColor[payment.status] ?? 'var(--text-3)'
                return <Icon className="h-9 w-9" style={{ color: col }} />
              })()}
              <div>
                <h2 className="font-bold text-white text-xl">{formatCurrency(payment.amount)}</h2>
                <Badge label={payment.status} color={statusColor(payment.status)} />
              </div>
            </div>

            <div className="card-body space-y-1">
              {/* Details */}
              {[
                { label: 'Reference', value: payment.payment_reference },
                { label: 'Method', value: payment.payment_method === 'online' ? 'Online (Paystack)' : 'Reference ID' },
                { label: 'Date', value: formatDateTime(payment.created_at) },
                ...(payment.description ? [{ label: 'Description', value: payment.description }] : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 py-2.5"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>{label}</span>
                  <span className="text-sm font-semibold text-white text-right">{value}</span>
                </div>
              ))}

              {/* Receipt link */}
              {payment.receipt && (
                <div
                  className="mt-3 rounded-xl p-4"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#6ee7b7' }}>Receipt Generated</p>
                      <p className="text-xs" style={{ color: 'rgba(110,231,183,0.6)' }}>{payment.receipt.receipt_number}</p>
                    </div>
                    <Link
                      href="/receipts"
                      className="btn btn-sm"
                      style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      <Receipt className="h-3.5 w-3.5" /> View Receipt
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
