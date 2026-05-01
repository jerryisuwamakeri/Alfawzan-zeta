'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Eye, Trash2, Search, Users } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Avatar, Badge, EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate, statusColor } from '@/lib/utils'

interface Student {
  id: number; full_name: string; first_name: string; surname: string
  email: string; phone: string; license_type: string; status: string
  created_at: string; nin_number?: string; local_govt?: string
}

interface Meta { current_page: number; last_page: number; total: number }

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [query, setQuery] = useState('')

  const key = `/admin/students?page=${page}&search=${query}&status=${statusFilter}`
  const { data, isLoading, mutate } = useSWR(key,
    () => api.get<{ data: Student[]; meta: Meta }>('/admin/students', {
      page: String(page), search: query, status: statusFilter,
    })
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(search)
    setPage(1)
  }

  async function deleteStudent(id: number) {
    if (!confirm('Delete this student application? This cannot be undone.')) return
    await api.delete(`/admin/students/${id}`)
    mutate()
  }

  return (
    <DashboardLayout title="Student Applications" requiredRole="admin">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h2 className="page-title">Student Applications</h2>
            <p className="page-subtitle">
              {data?.meta.total != null ? `${data.meta.total} total applications` : 'All registrations'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--text-3)' }} />
              <input
                className="input pl-9"
                placeholder="Search by name, email, phone, NIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>
          <select className="input w-auto" value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="table-wrapper">
          {isLoading ? <PageLoader /> : !data?.data.length ? (
            <EmptyState icon={<Users className="h-8 w-8" />} title="No applications found"
              description="Student registrations will appear here." />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Phone</th>
                    <th>Licence</th>
                    <th>LGA</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.full_name || s.first_name || '?'} size="sm" />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                              {s.full_name || `${s.first_name} ${s.surname}`}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-2)' }}>{s.phone}</td>
                      <td>
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>
                          {s.license_type}
                        </span>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-2)' }}>{(s as any).local_govt || '—'}</td>
                      <td><Badge label={s.status} color={statusColor(s.status)} /></td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(s.created_at)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/students/${s.id}`} className="btn btn-secondary btn-sm">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          <a href={`/register/print/${s.id}`} target="_blank" className="btn btn-ghost btn-sm"
                            style={{ color: '#a5b4fc' }} title="Download form">
                            PDF
                          </a>
                          <button onClick={() => deleteStudent(s.id)} className="btn btn-ghost btn-sm"
                            style={{ color: '#fca5a5' }} title="Delete">
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
