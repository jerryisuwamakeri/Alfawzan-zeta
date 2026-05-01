'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [paymentId, setPaymentId] = useState<number | null>(null)

  useEffect(() => {
    const reference = searchParams.get('reference')
    if (!reference) {
      setStatus('error')
      return
    }

    api.get<{ data: { id: number } }>(`/user/payments/verify`, { reference })
      .then((res) => {
        setStatus('success')
        setPaymentId(res.data.id)
        setTimeout(() => router.push(`/payments/${res.data.id}?success=1`), 2000)
      })
      .catch(() => {
        setStatus('error')
        setTimeout(() => router.push('/payments'), 3000)
      })
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600 mb-4" />
            <h2 className="text-lg font-semibold text-slate-800">Verifying payment…</h2>
            <p className="mt-1 text-sm text-slate-500">Please wait while we confirm your transaction.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-14 w-14 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="mt-2 text-sm text-slate-500">Redirecting to your payment details…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Payment Failed</h2>
            <p className="mt-2 text-sm text-slate-500">Something went wrong. Redirecting to payments…</p>
          </>
        )}
      </div>
    </div>
  )
}
