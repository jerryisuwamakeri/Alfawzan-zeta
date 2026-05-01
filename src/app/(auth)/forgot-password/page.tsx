'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car, Loader2, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { Alert } from '@/components/ui'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await api.post<{ message: string }>('/auth/forgot-password', { email })
      setMessage(res.message)
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Car className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Alfawzan Driving School</span>
        </div>

        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Reset password</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {message && <Alert type="success" message={message} />}
          {error && <Alert type="error" message={error} />}

          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email" type="email" className="input"
              placeholder="you@example.com" required autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height: '40px' }}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--text-2)' }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    </div>
  )
}
