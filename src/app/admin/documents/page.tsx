'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR, { useSWRConfig } from 'swr'
import { Plus, Trash2, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate, formatFileSize } from '@/lib/utils'
import type { Document, PaginationMeta } from '@/types'

export default function AdminDocumentsPage() {
  const [page, setPage] = useState(1)
  const { mutate } = useSWRConfig()

  const { data, isLoading } = useSWR(
    `/admin/documents?page=${page}`,
    () => api.get<{ data: Document[]; meta: PaginationMeta }>('/admin/documents', { page: String(page) })
  )

  async function deleteDoc(id: number) {
    if (!confirm('Delete this document?')) return
    await api.delete(`/admin/documents/${id}`)
    mutate(`/admin/documents?page=${page}`)
  }

  return (
    <DashboardLayout title="Documents" requiredRole="admin">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h2 className="page-title">Documents</h2>
            <p className="page-subtitle">Manage PDF files available to students</p>
          </div>
          <Link href="/admin/documents/upload" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Upload Document
          </Link>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No documents yet"
              description="Upload your first document to make it available to students."
              action={<Link href="/admin/documents/upload" className="btn btn-primary btn-sm"><Plus className="h-3.5 w-3.5" /> Upload</Link>}
            />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Description</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
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
                      <td className="text-xs" style={{ color: 'var(--text-2)' }}>{doc.description ? doc.description.slice(0, 50) : '—'}</td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatFileSize(doc.file_size)}</td>
                      <td>
                        <Badge
                          label={doc.is_active ? 'Active' : 'Inactive'}
                          color={doc.is_active
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                            : 'bg-red-900/40 text-red-400 border border-red-800/50'}
                        />
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-2)' }}>{doc.uploader?.name ?? '—'}</td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(doc.created_at)}</td>
                      <td className="text-right">
                        <button onClick={() => deleteDoc(doc.id)} className="btn btn-ghost btn-sm" style={{ color: '#fca5a5' }}>
                          <Trash2 className="h-3.5 w-3.5" />
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
