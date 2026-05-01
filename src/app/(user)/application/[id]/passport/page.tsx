'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Upload, Loader2, CheckCircle } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert, PageLoader } from '@/components/ui'
import { api } from '@/lib/api'

export default function UploadPassportPage() {
  const { id } = useParams<{ id: string }>()
  const { data, mutate } = useSWR(`/user/applications/${id}`,
    () => api.get<{ data: { passport_url?: string } }>(`/user/applications/${id}`)
  )
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true); setSuccess(''); setError('')
    const fd = new FormData()
    fd.append('passport', file)
    try {
      await api.post(`/user/applications/${id}/passport`, fd)
      setSuccess('Passport uploaded successfully.')
      mutate()
    } catch { setError('Upload failed. Please try a smaller image.') }
    finally { setUploading(false) }
  }

  const current = data?.data?.passport_url

  return (
    <DashboardLayout title="Upload Passport" requiredRole="user">
      <div className="mx-auto max-w-sm space-y-5">
        <Link href={`/application/${id}`} className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
          <ArrowLeft className="h-4 w-4" /> Back to application
        </Link>

        <div className="page-header mb-0">
          <h2 className="page-title">Passport Photo</h2>
          <p className="page-subtitle">Upload a clear passport-size photo</p>
        </div>

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

        {/* Current photo */}
        {(preview || current) && (
          <div className="flex justify-center">
            <img
              src={preview || current}
              alt="Passport"
              className="h-40 w-32 object-cover rounded-lg"
              style={{ border: '2px solid var(--border-md)' }}
            />
          </div>
        )}

        {/* Upload zone */}
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer transition-colors rounded-lg"
          style={{
            border: '2px dashed var(--border-md)',
            background: 'var(--surface-2)',
          }}
        >
          {uploading
            ? <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#a5b4fc' }} />
            : success
            ? <CheckCircle className="h-8 w-8" style={{ color: '#6ee7b7' }} />
            : <Upload className="h-8 w-8" style={{ color: 'var(--text-3)' }} />
          }
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {uploading ? 'Uploading...' : 'Click to upload photo'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              JPG, PNG — max 2MB. Passport size recommended.
            </p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    </DashboardLayout>
  )
}
