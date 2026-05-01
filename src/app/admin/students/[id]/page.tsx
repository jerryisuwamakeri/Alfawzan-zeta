'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, PageLoader, Alert } from '@/components/ui'
import { api } from '@/lib/api'
import { formatDate, statusColor } from '@/lib/utils'

interface Student {
  id: number; full_name: string; first_name: string; surname: string; othername: string
  mothers_maiden_name: string; gender: string; date_of_birth: string; blood_group: string
  facial_mark: boolean; height: string; requires_glasses: boolean; has_disability: boolean
  disability_details: string; next_of_kin_phone: string; nin_number: string; marital_status: string
  email: string; phone: string; address: string; state_of_origin: string; local_govt: string
  license_type: string; additional_info: string; status: string; passport_url?: string; created_at: string
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, mutate } = useSWR(`/admin/students/${id}`,
    () => api.get<{ data: Student }>(`/admin/students/${id}`)
  )
  const s = data?.data

  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  async function updateStatus() {
    if (!status) return
    setSaving(true); setMsg(''); setErr('')
    try {
      await api.patch(`/admin/students/${id}/status`, { status })
      setMsg('Status updated.')
      mutate()
    } catch { setErr('Failed to update status.') } finally { setSaving(false) }
  }

  async function uploadPassport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setMsg(''); setErr('')
    const fd = new FormData()
    fd.append('passport', file)
    try {
      await api.post(`/admin/students/${id}/passport`, fd)
      setMsg('Passport uploaded.')
      mutate()
    } catch { setErr('Upload failed.') } finally { setUploading(false) }
  }

  const Row = ({ label, value }: { label: string; value?: string | boolean | null }) => (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-3)', minWidth: 160 }}>{label}</span>
      <span className="text-sm text-right" style={{ color: 'var(--text)' }}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
      </span>
    </div>
  )

  return (
    <DashboardLayout title="Student Detail" requiredRole="admin">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
            <ArrowLeft className="h-4 w-4" /> Back to students
          </Link>
          <a href={`/register/print/${id}`} target="_blank" className="btn btn-secondary btn-sm">
            Download PDF Form
          </a>
        </div>

        {isLoading || !s ? <PageLoader /> : (
          <>
            {msg && <Alert type="success" message={msg} />}
            {err && <Alert type="error" message={err} />}

            {/* Header card */}
            <div className="card card-body flex items-start gap-5">
              {/* Passport */}
              <div className="shrink-0">
                <div
                  className="h-24 w-20 rounded-lg overflow-hidden flex items-center justify-center text-xs text-center"
                  style={{ background: 'var(--surface-2)', border: '2px dashed var(--border-md)', color: 'var(--text-3)' }}
                >
                  {s.passport_url
                    ? <img src={s.passport_url} alt="Passport" className="h-full w-full object-cover" />
                    : 'No passport'}
                </div>
                <label className="mt-2 flex items-center gap-1 cursor-pointer text-xs" style={{ color: '#a5b4fc' }}>
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {uploading ? 'Uploading...' : 'Upload photo'}
                  <input type="file" className="hidden" accept="image/*" onChange={uploadPassport} />
                </label>
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  {s.first_name} {s.othername} {s.surname}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>{s.email} • {s.phone}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge label={s.status} color={statusColor(s.status)} />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>Registered {formatDate(s.created_at)}</span>
                </div>
              </div>

              {/* Status changer */}
              <div className="flex items-center gap-2 shrink-0">
                <select className="input text-sm w-32" value={status || s.status}
                  onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={updateStatus} disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Bio data */}
            <div className="card">
              <div className="card-header">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Bio Data</p>
              </div>
              <div className="card-body">
                <Row label="Full Name" value={`${s.first_name} ${s.othername || ''} ${s.surname}`.trim()} />
                <Row label="Mother's Maiden Name" value={s.mothers_maiden_name} />
                <Row label="Gender" value={s.gender} />
                <Row label="Date of Birth" value={s.date_of_birth ? formatDate(s.date_of_birth) : ''} />
                <Row label="Blood Group" value={s.blood_group} />
                <Row label="Marital Status" value={s.marital_status} />
                <Row label="Facial Mark" value={s.facial_mark} />
                <Row label="Height" value={s.height ? `${s.height}m` : ''} />
                <Row label="Requires Glasses" value={s.requires_glasses} />
                <Row label="Has Disability" value={s.has_disability} />
                {s.has_disability && <Row label="Disability Details" value={s.disability_details} />}
                <Row label="Next of Kin Phone" value={s.next_of_kin_phone} />
                <Row label="NIN Number" value={s.nin_number} />
              </div>
            </div>

            {/* Contact */}
            <div className="card">
              <div className="card-header">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Contact Details</p>
              </div>
              <div className="card-body">
                <Row label="Email" value={s.email} />
                <Row label="Phone" value={s.phone} />
                <Row label="Address" value={s.address} />
                <Row label="State of Origin" value={s.state_of_origin} />
                <Row label="Local Govt Area" value={s.local_govt} />
              </div>
            </div>

            {/* Training */}
            <div className="card">
              <div className="card-header">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Training Info</p>
              </div>
              <div className="card-body">
                <Row label="Licence Class" value={s.license_type} />
                {s.additional_info && <Row label="Additional Notes" value={s.additional_info} />}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
