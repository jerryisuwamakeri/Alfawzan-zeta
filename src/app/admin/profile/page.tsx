'use client'

import { useState, useEffect } from 'react'
import { Loader2, User, Lock, Save } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

export default function AdminProfilePage() {
  const { user, mutate } = useAuth()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    current_password: '', password: '', password_confirmation: '',
  })

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '', address: user.address ?? '' }))
  }, [user])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      setFieldErrors(fe => ({ ...fe, [field]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(''); setError(''); setFieldErrors({})
    setSaving(true)
    const payload: Record<string, string> = { name: form.name, email: form.email, phone: form.phone, address: form.address }
    if (form.password) {
      payload.current_password = form.current_password
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }
    try {
      await api.put('/user/profile', payload)
      setSuccess('Profile updated successfully.')
      mutate()
      setForm(f => ({ ...f, current_password: '', password: '', password_confirmation: '' }))
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> }
      if (e.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(e.errors)) flat[k] = v[0]
        setFieldErrors(flat)
      } else { setError(e.message || 'Update failed.') }
    } finally { setSaving(false) }
  }

  const initials = user?.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? ''

  return (
    <DashboardLayout title="My Profile" requiredRole="admin">
      <div className="mx-auto max-w-xl space-y-5">
        <div className="page-header mb-0">
          <h2 className="page-title">Admin Profile</h2>
          <p className="page-subtitle">Update your name, email and password</p>
        </div>

        <div className="card card-body flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
            {initials}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>{user?.email}</p>
            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium mt-1"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>
              Administrator
            </span>
          </div>
        </div>

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <User className="h-4 w-4" style={{ color: '#a5b4fc' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Personal Information</p>
            </div>
            <div className="card-body space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="name">Full Name *</label>
                  <input id="name" className={`input ${fieldErrors.name ? 'input-error' : ''}`}
                    required value={form.name} onChange={set('name')} />
                  {fieldErrors.name && <p className="error-text">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="email">Email *</label>
                  <input id="email" type="email" className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                    required value={form.email} onChange={set('email')} />
                  {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="phone">Phone</label>
                  <input id="phone" className="input" value={form.phone} onChange={set('phone')} />
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Lock className="h-4 w-4" style={{ color: '#fcd34d' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Change Password</p>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>— leave blank to keep current</span>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label" htmlFor="current_password">Current Password</label>
                <input id="current_password" type="password"
                  className={`input ${fieldErrors.current_password ? 'input-error' : ''}`}
                  placeholder="Enter current password"
                  value={form.current_password} onChange={set('current_password')} />
                {fieldErrors.current_password && <p className="error-text">{fieldErrors.current_password}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="password">New Password</label>
                  <input id="password" type="password"
                    className={`input ${fieldErrors.password ? 'input-error' : ''}`}
                    placeholder="Min 8 characters"
                    value={form.password} onChange={set('password')} />
                  {fieldErrors.password && <p className="error-text">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="password_confirmation">Confirm Password</label>
                  <input id="password_confirmation" type="password" className="input"
                    placeholder="Repeat new password"
                    value={form.password_confirmation} onChange={set('password_confirmation')} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary w-full" style={{ height: 40 }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
