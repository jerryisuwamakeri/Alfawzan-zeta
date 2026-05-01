'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Alert } from '@/components/ui'
import { usePublicSettings } from '@/hooks/usePublicSettings'

const LICENSE_TYPES = [
  { value: 'A', label: 'Class A — Motorcycle' },
  { value: 'B', label: 'Class B — Car / Light Vehicle' },
  { value: 'C', label: 'Class C — Truck / Heavy Vehicle' },
  { value: 'D', label: 'Class D — Bus / Commercial' },
  { value: 'E', label: 'Class E — Special / Articulated' },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const KADUNA_LGAS = [
  'Birnin Gwari','Chikun','Giwa','Igabi','Ikara','Jaba',"Jema'a",
  'Kachia','Kaduna North','Kaduna South','Kagarko','Kajuru','Kaura',
  'Kauru','Kubau','Kudan','Lere','Makarfi','Sabon Gari','Sanga',
  'Soba','Zangon Kataf','Zaria',
]

interface Registration { id: number; first_name: string; surname: string; full_name: string }

export default function RegisterPage() {
  const { logo_url, school_name } = usePublicSettings()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState<Registration | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    first_name: '', surname: '', othername: '', mothers_maiden_name: '',
    email: '', phone: '', date_of_birth: '', address: '',
    license_type: '', gender: '', blood_group: '', facial_mark: false,
    height: '', next_of_kin_phone: '', state_of_origin: 'Kaduna',
    local_govt: '', nin_number: '', marital_status: 'Single',
    requires_glasses: false, has_disability: false, disability_details: '',
    additional_info: '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      setForm(f => ({ ...f, [field]: val }))
      setFieldErrors(fe => ({ ...fe, [field]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setFieldErrors({})
    setLoading(true)
    try {
      const res = await api.post<{ data: Registration }>('/driving-school/register', form)
      setRegistered(res.data)
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) flat[k] = v[0]
        setFieldErrors(flat)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError(apiErr.message || 'Registration failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  // ── Helpers ────────────────────────────────────────────────────
  const L = (id: string, label: string, req = false) => (
    <label className="label" htmlFor={id}>
      {label}{req && <span style={{ color: '#f87171' }}> *</span>}
    </label>
  )
  const E = (key: string) => fieldErrors[key] ? <p className="error-text">{fieldErrors[key]}</p> : null

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <div className="mb-5 mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}>
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Application Submitted!</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-2)' }}>
            Welcome, <strong>{registered.first_name}</strong>. Your application has been received.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <a href={`/register/print/${registered.id}`} target="_blank" className="btn btn-secondary btn-lg w-full">
              Download Registration Form (PDF)
            </a>
            <Link href="/login" className="btn btn-primary btn-lg w-full">Continue to Login</Link>
            <Link href="/" className="btn btn-ghost w-full" style={{ color: 'var(--text-2)' }}>Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-5" style={{ color: 'var(--text-2)' }}>
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            {logo_url
              ? <img src={logo_url} alt={school_name || 'Alfawzan'} style={{ height: 48, objectFit: 'contain' }} />
              : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-sm">AF</div>
            }
            <div>
              <h1 className="text-lg font-bold leading-none" style={{ color: 'var(--text)' }}>
                {school_name || 'Alfawzan Driving School'}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Student Registration Form</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Fill in your details below. Fields marked <span style={{ color: '#f87171' }}>*</span> are required.
          </p>
        </div>

        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Section A: Bio Data ── */}
          <div className="card">
            <div className="card-header">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                Section A — Bio Data
              </p>
            </div>
            <div className="card-body space-y-4">

              {/* Names — stack on mobile, 3 cols on desktop */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  {L('first_name', 'First Name', true)}
                  <input id="first_name" className={`input ${fieldErrors.first_name ? 'input-error' : ''}`}
                    placeholder="e.g. Abdullahi" required value={form.first_name} onChange={set('first_name')} />
                  {E('first_name')}
                </div>
                <div>
                  {L('othername', 'Other Name')}
                  <input id="othername" className="input" placeholder="e.g. Usman"
                    value={form.othername} onChange={set('othername')} />
                </div>
                <div>
                  {L('surname', 'Surname', true)}
                  <input id="surname" className={`input ${fieldErrors.surname ? 'input-error' : ''}`}
                    placeholder="e.g. Musa" required value={form.surname} onChange={set('surname')} />
                  {E('surname')}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  {L('mothers_maiden_name', "Mother's Maiden Name")}
                  <input id="mothers_maiden_name" className="input" placeholder="e.g. Maryam"
                    value={form.mothers_maiden_name} onChange={set('mothers_maiden_name')} />
                </div>
                <div>
                  {L('gender', 'Gender', true)}
                  <select id="gender" className={`input ${fieldErrors.gender ? 'input-error' : ''}`}
                    required value={form.gender} onChange={set('gender')}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                  {E('gender')}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  {L('date_of_birth', 'Date of Birth', true)}
                  <input id="date_of_birth" type="date"
                    className={`input ${fieldErrors.date_of_birth ? 'input-error' : ''}`}
                    required value={form.date_of_birth} onChange={set('date_of_birth')} />
                  {E('date_of_birth')}
                </div>
                <div>
                  {L('blood_group', 'Blood Group')}
                  <select id="blood_group" className="input" value={form.blood_group} onChange={set('blood_group')}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  {L('marital_status', 'Marital Status')}
                  <select id="marital_status" className="input" value={form.marital_status} onChange={set('marital_status')}>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  {L('height', 'Height (Metres)')}
                  <input id="height" className="input" placeholder="e.g. 1.76"
                    value={form.height} onChange={set('height')} />
                </div>
                <div>
                  {L('next_of_kin_phone', 'Next of Kin Phone')}
                  <input id="next_of_kin_phone" className="input" placeholder="+234 900 000 0000"
                    value={form.next_of_kin_phone} onChange={set('next_of_kin_phone')} />
                </div>
              </div>

              <div>
                {L('nin_number', 'NIN Number')}
                <input id="nin_number" className="input" placeholder="e.g. 57009843256"
                  value={form.nin_number} onChange={set('nin_number')} />
              </div>

              {/* Checkboxes — always stacked cleanly */}
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input id="facial_mark" type="checkbox" className="h-4 w-4 rounded" style={{ accentColor: '#6366f1' }}
                    checked={form.facial_mark} onChange={set('facial_mark')} />
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>Has Facial Mark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input id="requires_glasses" type="checkbox" className="h-4 w-4 rounded" style={{ accentColor: '#6366f1' }}
                    checked={form.requires_glasses} onChange={set('requires_glasses')} />
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>Requires Glasses</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input id="has_disability" type="checkbox" className="h-4 w-4 rounded" style={{ accentColor: '#6366f1' }}
                    checked={form.has_disability} onChange={set('has_disability')} />
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>Has Disability</span>
                </label>
              </div>
              {form.has_disability && (
                <div>
                  {L('disability_details', 'Disability Details')}
                  <input className="input" placeholder="Please describe"
                    value={form.disability_details} onChange={set('disability_details')} />
                </div>
              )}
            </div>
          </div>

          {/* ── Section B: Contact Details ── */}
          <div className="card">
            <div className="card-header">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                Section B — Contact Details
              </p>
            </div>
            <div className="card-body space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  {L('email', 'Email Address', true)}
                  <input id="email" type="email"
                    className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com" required
                    value={form.email} onChange={set('email')} />
                  {E('email')}
                </div>
                <div>
                  {L('phone', 'Phone Number', true)}
                  <input id="phone"
                    className={`input ${fieldErrors.phone ? 'input-error' : ''}`}
                    placeholder="+234 915 604 6098" required
                    value={form.phone} onChange={set('phone')} />
                  {E('phone')}
                </div>
              </div>

              <div>
                {L('address', 'Permanent Home Address', true)}
                <textarea id="address"
                  className={`input ${fieldErrors.address ? 'input-error' : ''}`}
                  rows={2} placeholder="e.g. Kodar Arewa, Gidan Soro, Danguziri" required
                  value={form.address} onChange={set('address')} />
                {E('address')}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  {L('state_of_origin', 'State of Origin')}
                  <input id="state_of_origin" className="input"
                    value={form.state_of_origin} onChange={set('state_of_origin')} />
                </div>
                <div>
                  {L('local_govt', 'Local Government Area')}
                  <select id="local_govt" className="input" value={form.local_govt} onChange={set('local_govt')}>
                    <option value="">Select LGA</option>
                    {KADUNA_LGAS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section C: Licence & Training ── */}
          <div className="card">
            <div className="card-header">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                Section C — Licence & Training
              </p>
            </div>
            <div className="card-body space-y-4">
              <div>
                {L('license_type', 'Licence Class', true)}
                <select id="license_type"
                  className={`input ${fieldErrors.license_type ? 'input-error' : ''}`}
                  required value={form.license_type} onChange={set('license_type')}>
                  <option value="">Select licence class</option>
                  {LICENSE_TYPES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                {E('license_type')}
              </div>
              <div>
                {L('additional_info', 'Additional Notes')}
                <textarea id="additional_info" className="input" rows={3}
                  placeholder="Any additional notes or special requirements (optional)"
                  value={form.additional_info} onChange={set('additional_info')} />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pb-8">
            <Link href="/" className="btn btn-secondary flex-1 sm:flex-none sm:w-32">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1" style={{ height: 44 }}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Registration
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
