'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Upload } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert } from '@/components/ui'
import { api } from '@/lib/api'

export default function UploadDocumentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ title: '', description: '', is_active: true })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setFieldErrors((fe) => ({ ...fe, [field]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    setError('')
    setFieldErrors({})
    setLoading(true)

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('is_active', form.is_active ? '1' : '0')
    formData.append('file', file)

    try {
      await api.post('/admin/documents', formData)
      router.push('/admin/documents')
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) flat[k] = v[0]
        setFieldErrors(flat)
      } else {
        setError(apiErr.message || 'Upload failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Upload Document" requiredRole="admin">
      <div className="mx-auto max-w-lg">
        <Link
          href="/admin/documents"
          className="inline-flex items-center gap-1.5 text-sm mb-5"
          style={{ color: 'var(--text-2)' }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to documents
        </Link>
        <div className="page-header mt-3 mb-5">
          <h2 className="page-title">Upload Document</h2>
          <p className="page-subtitle">Add a PDF or document file for students to download</p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="mb-5"><Alert type="error" message={error} /></div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="title">Title *</label>
                <input id="title" className={`input ${fieldErrors.title ? 'input-error' : ''}`}
                  placeholder="e.g. Driving Theory Manual" required value={form.title} onChange={set('title')} />
                {fieldErrors.title && <p className="error-text">{fieldErrors.title}</p>}
              </div>
              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" className="input" rows={3}
                  placeholder="Brief description of the document (optional)"
                  value={form.description} onChange={set('description')} />
              </div>

              {/* File drop zone */}
              <div>
                <label className="label" htmlFor="file">File *</label>
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors"
                  style={{
                    background: file ? 'rgba(99,102,241,0.06)' : 'var(--surface-2)',
                    borderColor: file ? 'rgba(99,102,241,0.4)' : fieldErrors.file ? '#ef4444' : 'var(--border-md)',
                  }}
                >
                  <Upload
                    className="h-7 w-7"
                    style={{ color: file ? '#a5b4fc' : 'var(--text-3)' }}
                  />
                  {file ? (
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: '#a5b4fc' }}>{file.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Click to select file</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>PDF, JPG, PNG, DOCX — max 10 MB</p>
                    </div>
                  )}
                  <input id="file" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                {fieldErrors.file && <p className="error-text">{fieldErrors.file}</p>}
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  id="is_active" type="checkbox" className="h-4 w-4 rounded"
                  style={{ accentColor: '#6366f1' }}
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <label htmlFor="is_active" className="text-sm" style={{ color: 'var(--text-2)' }}>
                  Make available to students immediately
                </label>
              </div>

              <div className="flex gap-3 pt-1">
                <Link href="/admin/documents" className="btn btn-secondary flex-1">Cancel</Link>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
