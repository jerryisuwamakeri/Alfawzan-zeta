'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Car, Loader2 } from 'lucide-react'
import { api, setToken } from '@/lib/api'
import { Alert } from '@/components/ui'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import type { User } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { logo_url, school_name } = usePublicSettings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password, remember })
      setToken(res.token)
      localStorage.setItem('auth_user', JSON.stringify(res.user))
      if (res.user.role === 'admin') router.push('/admin/dashboard')
      else if (res.user.role === 'agent') router.push('/agent/dashboard')
      else router.push('/dashboard')
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg)' }}
    >
      {/* Left panel – branding (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-80 xl:w-96 flex-col justify-between p-10 shrink-0"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <div>
          <div className="mb-16">
            {logo_url
              ? <img src={logo_url} alt={school_name || 'Alfawzan'} style={{ height: 64, objectFit: 'contain' }} />
              : <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                    <Car className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Alfawzan</span>
                </div>
            }
          </div>
          <h2 className="text-xl font-semibold leading-snug" style={{ color: 'var(--text)' }}>
            Professional driver education in Nigeria.
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
            FRSC &amp; KASTLEA accredited institution offering comprehensive training programs for all driver levels.
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          © {new Date().getFullYear()} Alfawzan Driving School Ltd.
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            {logo_url
              ? <img src={logo_url} alt={school_name || 'Alfawzan'} style={{ height: 48, objectFit: 'contain' }} />
              : <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                    <Car className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Alfawzan Driving School</span>
                </div>
            }
          </div>

          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Sign in</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <Alert type="error" message={error} />}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email" type="email" className="input"
                placeholder="you@example.com" required autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs" style={{ color: '#a5b4fc' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password" type="password" className="input"
                placeholder="••••••••" required
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember" type="checkbox"
                className="h-4 w-4 rounded"
                style={{ accentColor: '#6366f1' }}
                checked={remember} onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm" style={{ color: 'var(--text-2)' }}>
                Remember me
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height: '40px' }}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-2)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium" style={{ color: '#a5b4fc' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
