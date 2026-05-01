'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Receipt, Download, Eye } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Receipt as ReceiptType, PaginationMeta } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function ReceiptsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSWR(
    `/user/receipts?page=${page}`,
    () => api.get<{ data: ReceiptType[]; meta: PaginationMeta }>('/user/receipts', { page: String(page) })
  )

  function downloadReceipt(id: number) {
    const token = localStorage.getItem('auth_token')
    window.open(`${API_URL}/user/receipts/${id}/download?token=${token}`, '_blank')
  }

  return (
    <DashboardLayout title="Receipts" requiredRole="user">
      <div className="space-y-5">
        <div className="page-header">
          <h2 className="page-title">Receipts</h2>
          <p className="page-subtitle">Download your payment receipts</p>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState icon={<Receipt className="h-8 w-8" />} title="No receipts yet" description="Receipts are generated after successful payments." />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Amount</th>
                    <th>Payment Ref</th>
                    <th>Method</th>
                    <th>Generated</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}
                          >
                            <Receipt className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-white">{r.receipt_number}</span>
                        </div>
                      </td>
                      <td className="font-semibold" style={{ color: '#6ee7b7' }}>{formatCurrency(r.payment.amount)}</td>
                      <td>
                        <code
                          className="rounded px-2 py-0.5 text-xs font-mono"
                          style={{ background: 'var(--surface-3)', color: 'var(--text)' }}
                        >
                          {r.payment.payment_reference.slice(0, 16)}
                        </code>
                      </td>
                      <td className="capitalize text-sm" style={{ color: 'var(--text-2)' }}>{r.payment.payment_method}</td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(r.generated_at)}</td>
                      <td className="text-right">
                        <button onClick={() => downloadReceipt(r.id)} className="btn btn-primary btn-sm">
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
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
