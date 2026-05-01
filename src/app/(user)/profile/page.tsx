'use client'

import { useState, useEffect } from 'react'
import { Loader2, User } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const { user, mutate } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    current_password: '', password: '', password_confirmation: '',
  })

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
      }))
    }
  }, [user])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setFieldErrors((fe) => ({ ...fe, [field]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})
    setLoading(true)

    const payload: Record<string, string> = {
      name: form.name, email: form.email,
      phone: form.phone, address: form.address,
    }
    if (form.password) {
      payload.current_password = form.current_password
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    try {
      await api.put('/user/profile', payload)
      setSuccess('Profile updated successfully.')
      mutate()
      setForm((f) => ({ ...f, current_password: '', password: '', password_confirmation: '' }))
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) flat[k] = v[0]
        setFieldErrors(flat)
      } else {
        setError(apiErr.message || 'Update failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Profile" requiredRole="user">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="page-header mb-0">
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Manage your personal information</p>
        </div>

        <div className="card">
          <div className="card-header flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
            >
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-2)' }}>{user?.role}</p>
            </div>
          </div>
          <div className="card-body">
            {success && <div className="mb-5"><Alert type="success" message={success} /></div>}
            {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Personal Info</h3>
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
                  <input id="phone" className="input" placeholder="+234 800 000 0000"
                    value={form.phone} onChange={set('phone')} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="address">Address</label>
                <textarea id="address" className="input" rows={2} value={form.address} onChange={set('address')} />
              </div>

              <hr style={{ borderColor: 'var(--border)' }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Change Password</h3>
              <p className="text-xs -mt-3" style={{ color: 'var(--text-3)' }}>Leave blank to keep your current password.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="current_password">Current Password</label>
                  <input id="current_password" type="password" className={`input ${fieldErrors.current_password ? 'input-error' : ''}`}
                    value={form.current_password} onChange={set('current_password')} />
                  {fieldErrors.current_password && <p className="error-text">{fieldErrors.current_password}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="password">New Password</label>
                  <input id="password" type="password" className={`input ${fieldErrors.password ? 'input-error' : ''}`}
                    value={form.password} onChange={set('password')} />
                  {fieldErrors.password && <p className="error-text">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="password_confirmation">Confirm Password</label>
                  <input id="password_confirmation" type="password" className="input"
                    value={form.password_confirmation} onChange={set('password_confirmation')} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
