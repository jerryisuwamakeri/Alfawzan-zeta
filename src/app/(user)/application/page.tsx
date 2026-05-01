'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { FileText, Plus, Eye, Edit, Trash2, Upload } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, EmptyState, PageLoader } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate, statusColor } from '@/lib/utils'

interface Application {
  id: number; full_name: string; first_name: string; surname: string
  license_type: string; status: string; created_at: string; passport_url?: string
}

export default function UserApplicationPage() {
  const { data, isLoading, mutate } = useSWR('/user/applications',
    () => api.get<{ data: Application[] }>('/user/applications')
  )

  async function deleteApp(id: number) {
    if (!confirm('Delete this application? This cannot be undone.')) return
    try {
      await api.delete(`/user/applications/${id}`)
      mutate()
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete.')
    }
  }

  const apps = data?.data ?? []

  return (
    <DashboardLayout title="My Application" requiredRole="user">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h2 className="page-title">My Application</h2>
            <p className="page-subtitle">View and manage your registration</p>
          </div>
          {apps.length === 0 && (
            <Link href="/register" className="btn btn-primary">
              <Plus className="h-4 w-4" /> Apply Now
            </Link>
          )}
        </div>

        {isLoading ? <PageLoader /> : apps.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No application yet"
            description="Submit your registration to get started."
            action={<Link href="/register" className="btn btn-primary btn-sm"><Plus className="h-3.5 w-3.5" /> Register Now</Link>}
          />
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app.id} className="card">
                <div className="card-header flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Passport thumbnail */}
                    <div
                      className="h-16 w-12 shrink-0 rounded overflow-hidden flex items-center justify-center text-xs"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-md)', color: 'var(--text-3)' }}
                    >
                      {app.passport_url
                        ? <img src={app.passport_url} alt="Passport" className="h-full w-full object-cover" />
                        : <span className="text-center text-[9px] px-1">No photo</span>
                      }
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>
                        {app.first_name || app.full_name}  {app.surname ?? ''}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                        Licence: <strong>{app.license_type}</strong> &nbsp;·&nbsp; Applied {formatDate(app.created_at)}
                      </p>
                      <div className="mt-2">
                        <Badge label={app.status.charAt(0).toUpperCase() + app.status.slice(1)} color={statusColor(app.status)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/application/${app.id}`} className="btn btn-secondary btn-sm">
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Link>
                    {app.status === 'pending' && (
                      <Link href={`/application/${app.id}/edit`} className="btn btn-secondary btn-sm">
                        <Edit className="h-3.5 w-3.5" /> Edit Details
                      </Link>
                    )}
                    <Link href={`/application/${app.id}/passport`} className="btn btn-secondary btn-sm">
                      <Upload className="h-3.5 w-3.5" /> Upload Passport
                    </Link>
                    <a href={`/register/print/${app.id}`} target="_blank" className="btn btn-secondary btn-sm"
                      style={{ color: '#a5b4fc' }}>
                      <FileText className="h-3.5 w-3.5" /> Download Form
                    </a>
                    {app.status !== 'approved' && (
                      <button onClick={() => deleteApp(app.id)} className="btn btn-ghost btn-sm" style={{ color: '#fca5a5' }}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
