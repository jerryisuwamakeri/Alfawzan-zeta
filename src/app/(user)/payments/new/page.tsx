'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CreditCard, Shield, Receipt } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert } from '@/components/ui'
import { api } from '@/lib/api'

export default function NewPaymentPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'reference' | ''>('')
  const [amount, setAmount] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const res = await api.post<{
        type: 'online' | 'reference'
        authorization_url?: string
        payment_reference?: string
        payment?: { id: number }
      }>('/user/payments', {
        payment_method: paymentMethod,
        amount: parseFloat(amount),
        reference_id: referenceId || undefined,
        description: description || undefined,
        callback_url: `${appUrl}/payment/callback`,
      })

      if (res.type === 'online' && res.authorization_url) {
        window.location.href = res.authorization_url
      } else if (res.type === 'reference' && res.payment) {
        router.push(`/payments/${res.payment.id}?success=1`)
      }
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) flat[k] = v[0]
        setFieldErrors(flat)
      } else {
        setError(apiErr.message || 'Payment failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Make Payment" requiredRole="user">
      <div className="mx-auto max-w-lg">
        <div className="mb-5">
          <Link
            href="/payments"
            className="inline-flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--text-2)' }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to payments
          </Link>
          <div className="page-header mt-3 mb-0">
            <h2 className="page-title">Make a Payment</h2>
            <p className="page-subtitle">Pay online or use an admin-issued reference ID</p>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Payment method selector */}
              <div>
                <label className="label">Payment Method *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'online', label: 'Online (Paystack)', icon: CreditCard, desc: 'Pay securely online' },
                    { value: 'reference', label: 'Reference ID', icon: Receipt, desc: 'Admin-issued code' },
                  ].map(({ value, label, icon: Icon, desc }) => {
                    const active = paymentMethod === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPaymentMethod(value as 'online' | 'reference')}
                        className="flex flex-col items-start rounded-xl p-4 text-left transition-all"
                        style={{
                          background: active ? 'rgba(99,102,241,0.12)' : 'var(--surface-2)',
                          border: active ? '2px solid rgba(99,102,241,0.5)' : '2px solid var(--border-md)',
                        }}
                      >
                        <Icon
                          className="h-5 w-5 mb-2"
                          style={{ color: active ? '#a5b4fc' : 'var(--text-3)' }}
                        />
                        <p
                          className="text-sm font-semibold"
                          style={{ color: active ? '#a5b4fc' : 'var(--text)' }}
                        >
                          {label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{desc}</p>
                      </button>
                    )
                  })}
                </div>
                {fieldErrors.payment_method && <p className="error-text">{fieldErrors.payment_method}</p>}
              </div>

              {/* Reference ID */}
              {paymentMethod === 'reference' && (
                <div>
                  <label className="label" htmlFor="reference_id">Reference ID *</label>
                  <input id="reference_id" className={`input ${fieldErrors.reference_id ? 'input-error' : ''}`}
                    placeholder="e.g. REF-XXXXXXXXXXXX" required={paymentMethod === 'reference'}
                    value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
                  {fieldErrors.reference_id && <p className="error-text">{fieldErrors.reference_id}</p>}
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
                    Enter the reference ID provided by the admin.
                  </p>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="label" htmlFor="amount">Amount (₦) *</label>
                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold"
                    style={{ color: 'var(--text-3)' }}
                  >
                    ₦
                  </span>
                  <input id="amount" type="number" step="0.01" min="1"
                    className={`input pl-8 ${fieldErrors.amount ? 'input-error' : ''}`}
                    placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                {fieldErrors.amount && <p className="error-text">{fieldErrors.amount}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" className="input" rows={3}
                  placeholder="Payment description (optional)"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="flex gap-3 pt-1">
                <Link href="/payments" className="btn btn-secondary flex-1">Cancel</Link>
                <button type="submit" disabled={loading || !paymentMethod} className="btn btn-primary flex-1">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {paymentMethod === 'online' ? 'Pay with Paystack' : 'Complete Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Shield, label: 'Secure Payment', sub: '256-bit SSL encrypted', color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)' },
            { icon: Receipt, label: 'Instant Receipt', sub: 'Auto-generated PDF', color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)' },
          ].map(({ icon: Icon, label, sub, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl p-3.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: bg, color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
