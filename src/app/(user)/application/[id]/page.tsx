'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Edit, Upload, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, PageLoader } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate, statusColor } from '@/lib/utils'

interface App {
  id: number; full_name: string; first_name: string; surname: string; othername: string
  mothers_maiden_name: string; gender: string; date_of_birth: string; blood_group: string
  facial_mark: boolean; height: string; requires_glasses: boolean; has_disability: boolean
  disability_details: string; next_of_kin_phone: string; nin_number: string; marital_status: string
  email: string; phone: string; address: string; state_of_origin: string; local_govt: string
  license_type: string; additional_info: string; status: string; passport_url?: string; created_at: string
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useSWR(`/user/applications/${id}`,
    () => api.get<{ data: App }>(`/user/applications/${id}`)
  )
  const app = data?.data

  const Row = ({ label, value }: { label: string; value?: string | boolean | null }) => (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-3)', minWidth: 160 }}>{label}</span>
      <span className="text-sm text-right" style={{ color: 'var(--text)' }}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
      </span>
    </div>
  )

  return (
    <DashboardLayout title="Application Details" requiredRole="user">
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/application" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex gap-2">
            {app?.status === 'pending' && (
              <Link href={`/application/${id}/edit`} className="btn btn-secondary btn-sm">
                <Edit className="h-3.5 w-3.5" /> Edit
              </Link>
            )}
            <a href={`/register/print/${id}`} target="_blank" className="btn btn-primary btn-sm">
              <FileText className="h-3.5 w-3.5" /> Download PDF
            </a>
          </div>
        </div>

        {isLoading || !app ? <PageLoader /> : (
          <>
            <div className="card card-body flex items-start gap-5">
              <div className="h-24 w-20 shrink-0 rounded overflow-hidden flex items-center justify-center text-xs"
                style={{ background: 'var(--surface-2)', border: '2px dashed var(--border-md)', color: 'var(--text-3)' }}>
                {app.passport_url
                  ? <img src={app.passport_url} alt="Passport" className="h-full w-full object-cover" />
                  : <span className="text-center text-[9px] px-1">No passport<br />uploaded</span>
                }
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  {app.first_name} {app.othername} {app.surname}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>{app.email} · {app.phone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={app.status.charAt(0).toUpperCase() + app.status.slice(1)} color={statusColor(app.status)} />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>Applied {formatDate(app.created_at)}</span>
                </div>
                <Link href={`/application/${id}/passport`} className="btn btn-secondary btn-sm mt-3">
                  <Upload className="h-3.5 w-3.5" /> Update Passport Photo
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Bio Data</p></div>
              <div className="card-body">
                <Row label="Full Name" value={`${app.first_name} ${app.othername || ''} ${app.surname}`.trim()} />
                <Row label="Mother's Maiden Name" value={app.mothers_maiden_name} />
                <Row label="Gender" value={app.gender} />
                <Row label="Date of Birth" value={app.date_of_birth ? formatDate(app.date_of_birth) : ''} />
                <Row label="Blood Group" value={app.blood_group} />
                <Row label="Marital Status" value={app.marital_status} />
                <Row label="Facial Mark" value={app.facial_mark} />
                <Row label="Height" value={app.height ? `${app.height}m` : ''} />
                <Row label="Requires Glasses" value={app.requires_glasses} />
                <Row label="Next of Kin Phone" value={app.next_of_kin_phone} />
                <Row label="NIN Number" value={app.nin_number} />
              </div>
            </div>

            <div className="card">
              <div className="card-header"><p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Contact</p></div>
              <div className="card-body">
                <Row label="Email" value={app.email} />
                <Row label="Phone" value={app.phone} />
                <Row label="Address" value={app.address} />
                <Row label="State of Origin" value={app.state_of_origin} />
                <Row label="Local Govt" value={app.local_govt} />
              </div>
            </div>

            <div className="card">
              <div className="card-header"><p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Training</p></div>
              <div className="card-body">
                <Row label="Licence Class" value={app.license_type} />
                {app.additional_info && <Row label="Notes" value={app.additional_info} />}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
