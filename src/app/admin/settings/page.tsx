'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Loader2, Upload, Globe, Phone, Image as ImageIcon, FileSignature } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Alert, PageLoader } from '@/components/ui'
import { api } from '@/lib/api'

interface Settings { [key: string]: string }

export default function AdminSettingsPage() {
  const { data, isLoading, mutate } = useSWR('/admin/settings',
    () => api.get<{ data: Settings }>('/admin/settings')
  )

  const [form, setForm] = useState<Settings>({})
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingSig, setUploadingSig] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (data?.data) setForm(data.data)
  }, [data])

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg(''); setErr('')
    try {
      await api.post('/admin/settings', form)
      setMsg('Settings saved successfully.')
      mutate()
    } catch { setErr('Failed to save settings.') } finally { setSaving(false) }
  }

  async function uploadFile(field: 'logo' | 'signature', file: File) {
    const setter = field === 'logo' ? setUploadingLogo : setUploadingSig
    setter(true); setMsg(''); setErr('')
    const fd = new FormData()
    fd.append(field, file)
    try {
      const res = await api.post<Record<string, string>>(`/admin/settings/${field}`, fd)
      const urlKey = field === 'logo' ? 'logo_url' : 'signature_url'
      setForm((f) => ({ ...f, [urlKey]: res[urlKey] }))
      setMsg(`${field === 'logo' ? 'Logo' : 'Signature'} uploaded.`)
      mutate()
    } catch { setErr('Upload failed.') } finally { setter(false) }
  }

  const InputRow = ({ id, label, placeholder }: { id: string; label: string; placeholder?: string }) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} className="input" placeholder={placeholder} value={form[id] || ''} onChange={set(id)} />
    </div>
  )

  return (
    <DashboardLayout title="Settings" requiredRole="admin">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="page-header mb-0">
          <h2 className="page-title">School Settings</h2>
          <p className="page-subtitle">Manage branding, contact details, and SEO</p>
        </div>

        {isLoading ? <PageLoader /> : (
          <form onSubmit={save} className="space-y-5">
            {msg && <Alert type="success" message={msg} />}
            {err && <Alert type="error" message={err} />}

            {/* Branding */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <ImageIcon className="h-4 w-4" style={{ color: '#a5b4fc' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Branding</p>
              </div>
              <div className="card-body space-y-4">
                <InputRow id="school_name" label="School Name" placeholder="Alfawzan Driving School Ltd." />
                <InputRow id="tagline" label="Tagline" placeholder="Driving Knowledge, Building Confidence & Ensuring Safety" />

                {/* Logo */}
                <div>
                  <label className="label">School Logo</label>
                  <div className="flex items-center gap-4">
                    {form.logo_url
                      ? <img src={form.logo_url} alt="Logo" className="h-14 w-auto rounded-lg object-contain"
                          style={{ background: 'var(--surface-2)', padding: 4 }} />
                      : <div className="h-14 w-20 rounded-lg flex items-center justify-center text-xs"
                          style={{ background: 'var(--surface-2)', border: '2px dashed var(--border-md)', color: 'var(--text-3)' }}>
                          No logo
                        </div>
                    }
                    <label className="btn btn-secondary btn-sm cursor-pointer">
                      {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                      <input type="file" className="hidden" accept="image/*"
                        onChange={(e) => e.target.files?.[0] && uploadFile('logo', e.target.files[0])} />
                    </label>
                  </div>
                  <InputRow id="logo_url" label="Or paste logo URL" placeholder="https://..." />
                </div>

                {/* Signature */}
                <div>
                  <label className="label">Director / Admin Signature</label>
                  <div className="flex items-center gap-4">
                    {form.signature_url
                      ? <img src={form.signature_url} alt="Signature" className="h-12 w-auto rounded"
                          style={{ background: 'white', padding: 4, border: '1px solid var(--border)' }} />
                      : <div className="h-12 w-32 rounded flex items-center justify-center text-xs"
                          style={{ background: 'var(--surface-2)', border: '2px dashed var(--border-md)', color: 'var(--text-3)' }}>
                          No signature
                        </div>
                    }
                    <label className="btn btn-secondary btn-sm cursor-pointer">
                      {uploadingSig ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
                      {uploadingSig ? 'Uploading...' : 'Upload signature'}
                      <input type="file" className="hidden" accept="image/*"
                        onChange={(e) => e.target.files?.[0] && uploadFile('signature', e.target.files[0])} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: '#6ee7b7' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Contact Information</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <InputRow id="phone" label="Primary Phone" placeholder="07062020506" />
                  <InputRow id="phone2" label="Phone 2" placeholder="08038482622" />
                  <InputRow id="phone3" label="Phone 3" placeholder="08024253755" />
                </div>
                <InputRow id="email" label="Email Address" placeholder="info@alfawzanresources.ng" />
                <InputRow id="address" label="Physical Address" placeholder="FF16 Zamzam Plaza, Opposite AA Rano Filling Station..." />
                <InputRow id="website" label="Website URL" placeholder="https://alfawzanresources.ng" />
              </div>
            </div>

            {/* SEO */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Globe className="h-4 w-4" style={{ color: '#fcd34d' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>SEO & Meta</p>
              </div>
              <div className="card-body space-y-4">
                <InputRow id="seo_title" label="Page Title" placeholder="Alfawzan Driving School | FRSC & KASTLEA Accredited, Kaduna" />
                <div>
                  <label className="label" htmlFor="seo_description">Meta Description</label>
                  <textarea id="seo_description" className="input" rows={3}
                    placeholder="Professional driving school in Kaduna, Nigeria..."
                    value={form.seo_description || ''} onChange={set('seo_description')} />
                </div>
                <InputRow id="seo_keywords" label="Keywords" placeholder="driving school kaduna, FRSC, driver education nigeria" />
              </div>
            </div>

            {/* Social */}
            <div className="card">
              <div className="card-header">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Social Media</p>
              </div>
              <div className="card-body space-y-4">
                <InputRow id="facebook_url" label="Facebook" placeholder="https://facebook.com/..." />
                <InputRow id="instagram_url" label="Instagram" placeholder="https://instagram.com/..." />
                <InputRow id="twitter_url" label="Twitter / X" placeholder="https://twitter.com/..." />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary w-full" style={{ height: '42px' }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save All Settings
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
