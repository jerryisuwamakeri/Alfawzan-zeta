'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Search, Users, Trash2, Shield, User as UserIcon } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Avatar, Badge, EmptyState, PageLoader, Pagination } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  created_at: string
}

interface Meta { current_page: number; last_page: number; total: number }

function roleColor(role: string) {
  if (role === 'admin')  return 'bg-indigo-900/40 text-indigo-400 border border-indigo-800/50'
  if (role === 'agent')  return 'bg-amber-900/40 text-amber-400 border border-amber-800/50'
  return 'bg-white/5 text-white/50'
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const key = `/admin/users?page=${page}&search=${query}&role=${roleFilter}`
  const { data, isLoading, mutate } = useSWR(key,
    () => api.get<{ data: User[]; meta: Meta }>('/admin/users', {
      page: String(page), search: query, role: roleFilter,
    })
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(search)
    setPage(1)
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      mutate()
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete user.')
    }
  }

  return (
    <DashboardLayout title="Users" requiredRole="admin">
      <div className="space-y-5">
        <div className="page-header mb-0">
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">
            {data?.meta.total != null ? `${data.meta.total} registered accounts` : 'All user accounts'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--text-3)' }} />
              <input
                className="input pl-9"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>
          <select
            className="input w-auto"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <PageLoader />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No users found"
              description="No accounts match your search."
            />
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-2)' }}>{u.phone || '—'}</td>
                      <td>
                        <Badge label={u.role} color={roleColor(u.role)} />
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(u.created_at)}</td>
                      <td className="text-right">
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#fca5a5' }}
                          title="Delete user"
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
