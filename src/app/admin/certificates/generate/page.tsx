'use client'

import { useState, useRef, memo, useDeferredValue } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowLeft, Printer } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'

interface CertData {
  certNo: string; fullName: string; licenseClass: string
  licenseClassLabel: string; completionDate: string
  issueDate: string; instructor: string; director: string
}

interface Settings { logo_url?: string; signature_url?: string; school_name?: string; phone?: string; address?: string }

const LICENSE_LABELS: Record<string, string> = {
  A: 'Class A — Motorcycle',
  B: 'Class B — Car / Light Vehicle',
  C: 'Class C — Truck / Heavy Vehicle',
  D: 'Class D — Bus / Commercial',
  E: 'Class E — Special / Articulated',
}

const empty = (): CertData => ({
  certNo: '', fullName: '', licenseClass: 'B',
  licenseClassLabel: 'Class B — Car / Light Vehicle',
  completionDate: new Date().toISOString().split('T')[0],
  issueDate: new Date().toISOString().split('T')[0],
  instructor: '', director: '',
})

function fmt(d: string) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

const CertPreview = memo(function CertPreview({ c, s }: { c: CertData; s: Settings }) {
  const schoolName = s.school_name || 'Al-Fawzan Driving School Limited'

  return (
    <div style={{
      fontFamily: 'Georgia, "Times New Roman", serif',
      background: 'white', color: '#111', padding: '28px 36px',
      border: '6px double #006400',
      outline: '2px solid #d4a017', outlineOffset: '-12px',
      minHeight: 460, position: 'relative', textAlign: 'center',
    }}>
      {/* Corner marks */}
      {[{ t: 8, l: 8 }, { t: 8, r: 8 }, { b: 8, l: 8 }, { b: 8, r: 8 }].map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: (p as any).t, bottom: (p as any).b, left: (p as any).l, right: (p as any).r,
          width: 20, height: 20,
          borderTop: (p as any).t !== undefined ? '2px solid #d4a017' : undefined,
          borderBottom: (p as any).b !== undefined ? '2px solid #d4a017' : undefined,
          borderLeft: (p as any).l !== undefined ? '2px solid #d4a017' : undefined,
          borderRight: (p as any).r !== undefined ? '2px solid #d4a017' : undefined,
        }} />
      ))}

      {/* Logo */}
      {s.logo_url
        ? <img src={s.logo_url} alt="Logo" style={{ height: 80, objectFit: 'contain', marginBottom: 6 }} />
        : (
          <div style={{ fontSize: 28, fontWeight: 900, fontStyle: 'italic', color: '#006400', lineHeight: 1.1, marginBottom: 4 }}>
            AF<br /><span style={{ fontSize: 18 }}>Al-Fawzan</span>
          </div>
        )
      }
      <div style={{ fontSize: 17, fontWeight: 900, color: '#006400', letterSpacing: 1, marginBottom: 2 }}>{schoolName}</div>
      <div style={{ fontSize: 8, color: '#666', marginBottom: 8 }}>
        FRSC &amp; KASTLEA Accredited Institution
      </div>

      <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#006400,#d4a017,#006400,transparent)', margin: '8px 20px' }} />

      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 5, color: '#006400', margin: '10px 0 2px' }}>CERTIFICATE</div>
      <div style={{ fontSize: 11, letterSpacing: 4, color: '#888', marginBottom: 10 }}>OF COMPLETION</div>

      <div style={{ fontSize: 10, color: '#555', marginBottom: 6 }}>THIS IS TO CERTIFY THAT</div>

      <div style={{
        fontSize: 26, fontWeight: 900, color: '#002200', letterSpacing: 1,
        borderBottom: '2px solid #006400', display: 'inline-block',
        padding: '4px 28px', margin: '0 0 10px', textTransform: 'uppercase',
      }}>
        {c.fullName || 'FULL NAME'}
      </div>

      <div style={{ fontSize: 11, color: '#444', lineHeight: 1.9, maxWidth: 420, margin: '0 auto 10px' }}>
        has successfully completed the required training programme in<br />
        <strong style={{ fontSize: 13, color: '#006400' }}>
          {c.licenseClassLabel || LICENSE_LABELS[c.licenseClass]}
        </strong>
        <br />
        at {schoolName} and is hereby certified as a competent driver
        in accordance with FRSC and KASTLEA standards.
      </div>

      {c.completionDate && (
        <div style={{ fontSize: 10, color: '#555', marginBottom: c.certNo ? 2 : 10 }}>
          Training completed: <strong style={{ color: '#002200' }}>{fmt(c.completionDate)}</strong>
        </div>
      )}
      {c.certNo && (
        <div style={{ fontSize: 9, color: '#999', marginBottom: 10 }}>Certificate No: <strong>{c.certNo}</strong></div>
      )}

      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#ccc,transparent)', margin: '8px 40px' }} />

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14 }}>
        <div style={{ textAlign: 'center' }}>
          {s.signature_url && (
            <img src={s.signature_url} alt="Sig" style={{ height: 36, objectFit: 'contain', marginBottom: 2 }} />
          )}
          <div style={{ borderTop: '1px solid #555', width: 130, margin: '0 auto', paddingTop: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 700 }}>{c.instructor || 'Instructor'}</div>
            <div style={{ fontSize: 8, color: '#777' }}>Instructor in Charge</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', alignSelf: 'flex-end' }}>
          <div style={{ fontSize: 9, color: '#666' }}>Date Issued: <strong>{fmt(c.issueDate)}</strong></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #555', width: 130, margin: '0 auto', paddingTop: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 700 }}>{c.director || 'Director'}</div>
            <div style={{ fontSize: 8, color: '#777' }}>Director / Principal</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 8, color: '#bbb', fontStyle: 'italic' }}>
        This certificate is issued under the authority of {schoolName} — FRSC &amp; KASTLEA Accredited
      </div>
    </div>
  )
})

// ── Field defined OUTSIDE component to prevent re-mount on every keystroke ──
interface CertFieldProps { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }
function CertField({ label, value, onChange, type = 'text', placeholder = '' }: CertFieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} className="input" placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

export default function GenerateCertificatePage() {
  const [cert, setCert] = useState<CertData>(empty())
  const printRef = useRef<HTMLDivElement>(null)

  const { data: settingsData } = useSWR('/admin/settings', () => api.get<{ data: Settings }>('/admin/settings'))
  const settings: Settings = settingsData?.data ?? {}

  // Deferred so typing is instant, preview updates slightly after
  const deferred = useDeferredValue(cert)

  function update(field: keyof CertData, val: string) {
    if (field === 'licenseClass') {
      setCert(c => ({ ...c, licenseClass: val, licenseClassLabel: LICENSE_LABELS[val] || '' }))
    } else {
      setCert(c => ({ ...c, [field]: val }))
    }
  }

  function print() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const w = window.open('', '_blank')!
    w.document.write(`<!DOCTYPE html><html><head><title>Certificate</title>
      <style>body{margin:0;padding:16px;background:white;}@page{size:A4 landscape;margin:8mm;}</style>
      </head><body>${content}</body></html>`)
    w.document.close()
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  return (
    <DashboardLayout title="Generate Certificate" requiredRole="admin">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <button onClick={print} className="btn btn-primary">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-4">
            <div className="page-header mb-0">
              <h2 className="page-title">Certificate Details</h2>
              <p className="page-subtitle">Live preview — logo &amp; signature from Settings</p>
            </div>
            <div className="card card-body space-y-4">
              <CertField label="Student Full Name" value={cert.fullName} onChange={v => update('fullName', v)} placeholder="ABDULLAHI MUSA" />
              <div className="grid grid-cols-2 gap-3">
                <CertField label="Certificate No." value={cert.certNo} onChange={v => update('certNo', v)} placeholder="CERT/2025/001" />
                <div>
                  <label className="label">Licence Class</label>
                  <select className="input" value={cert.licenseClass} onChange={e => update('licenseClass', e.target.value)}>
                    {Object.entries(LICENSE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <CertField label="Custom Description (optional)" value={cert.licenseClassLabel}
                onChange={v => setCert(c => ({ ...c, licenseClassLabel: v }))} placeholder="e.g. Defensive Driving" />
              <div className="grid grid-cols-2 gap-3">
                <CertField label="Completion Date" type="date" value={cert.completionDate} onChange={v => update('completionDate', v)} />
                <CertField label="Issue Date" type="date" value={cert.issueDate} onChange={v => update('issueDate', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CertField label="Instructor Name" value={cert.instructor} onChange={v => update('instructor', v)} placeholder="Instructor" />
                <CertField label="Director / Principal" value={cert.director} onChange={v => update('director', v)} placeholder="Director" />
              </div>
              {!settings.logo_url && (
                <div className="alert-info text-xs">
                  Upload your logo in <Link href="/admin/settings" className="underline font-medium">Settings</Link> to show it on certificates.
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="page-header mb-3">
              <h2 className="page-title">Preview</h2>
              <p className="page-subtitle">Prints landscape on A4</p>
            </div>
            <div ref={printRef}>
              <CertPreview c={deferred} s={settings} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
