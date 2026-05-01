'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { FileText, Download } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate, formatFileSize } from '@/lib/utils'
import type { Document, PaginationMeta } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function DocumentsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSWR(
    `/user/documents?page=${page}`,
    () => api.get<{ data: Document[]; meta: PaginationMeta }>('/user/documents', { page: String(page) })
  )

  function downloadDoc(id: number) {
    const token = localStorage.getItem('auth_token')
    window.open(`${API_URL}/user/documents/${id}/download?token=${token}`, '_blank')
  }

  return (
    <DashboardLayout title="Documents" requiredRole="user">
      <div className="space-y-5">
        <div className="page-header">
          <h2 className="page-title">Documents</h2>
          <p className="page-subtitle">Download your certificates and training materials</p>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No documents available"
              description="Documents uploaded by the school will appear here."
            />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Description</th>
                    <th>Size</th>
                    <th>Date</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}
                          >
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{doc.title}</p>
                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{doc.file_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-2)' }}>{doc.description ? doc.description.slice(0, 60) : '—'}</td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatFileSize(doc.file_size)}</td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(doc.created_at)}</td>
                      <td className="text-right">
                        <button
                          onClick={() => downloadDoc(doc.id)}
                          className="btn btn-primary btn-sm"
                        >
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
