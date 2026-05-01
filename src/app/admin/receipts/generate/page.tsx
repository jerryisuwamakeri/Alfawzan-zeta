'use client'

import { useState, useRef, memo, useDeferredValue } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowLeft, Printer, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { numberToWords } from '@/lib/numberToWords'
import { api } from '@/lib/api'

interface ReceiptData {
  receiptNo: string; date: string; receivedFrom: string
  amount: string; paymentFor: string; chequeNo: string
}
interface Settings { logo_url?: string; signature_url?: string; school_name?: string; phone?: string; phone2?: string; address?: string }

const empty = (): ReceiptData => ({
  receiptNo: '', date: new Date().toISOString().split('T')[0],
  receivedFrom: '', amount: '', paymentFor: 'DRIVERS TRAINING AND CERTIFICATION', chequeNo: '',
})

// ── Field input — defined OUTSIDE to avoid re-mount on every keystroke ──────
interface FieldProps { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }
function Field({ label, value, onChange, type = 'text', placeholder = '' }: FieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} className="input" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} />
    </div>
  )
}

// ── Preview memoized — only re-renders when data actually changes ─────────────
const ReceiptPreview = memo(function ReceiptPreview({ r, s }: { r: ReceiptData; s: Settings }) {
  const amt   = parseFloat(r.amount) || 0
  const words = amt > 0 ? `***${numberToWords(amt)}***` : ''
  const name  = s.school_name || 'Al-Fawzan Driving School Limited'
  const addr  = s.address || 'Shop FF16 Zamzam Plaza, Adjacent AA Rano Filling Station, Kasuwar Barchi, Tudun Wada Kaduna'
  const tel   = [s.phone, s.phone2].filter(Boolean).join(', ') || '07062020506, 08024253755'

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #ccc', padding: '14px 18px', background: 'white', color: '#000', fontSize: 11 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #006400', paddingBottom: 10, marginBottom: 10 }}>
        {s.logo_url
          ? <img src={s.logo_url} alt={name} style={{ height: 72, objectFit: 'contain', marginBottom: 4 }} />
          : <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#006400', lineHeight: 1 }}>
              AF<br /><span style={{ fontSize: 18 }}>Al-Fawzan</span>
            </div>
        }
        <div style={{ fontSize: 18, fontWeight: 900, color: '#006400', fontFamily: 'Georgia, serif' }}>{name}</div>
        <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>&#9679; {addr}</div>
        <div style={{ fontSize: 9, color: '#444' }}>Tel: {tel}</div>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontStyle: 'italic', fontSize: 11 }}>
          <em>Date:</em>{' '}
          <span style={{ borderBottom: '1px solid #555', minWidth: 80, display: 'inline-block' }}>
            {r.date ? new Date(r.date + 'T00:00:00').toLocaleDateString('en-GB') : ''}
          </span>
        </div>
        <div style={{ border: '2px solid #006400', padding: '3px 14px', fontWeight: 900, fontSize: 14, letterSpacing: 2, color: '#006400' }}>RECEIPT</div>
        <div style={{ fontStyle: 'italic', fontSize: 12 }}><em>N0.</em> <strong>{r.receiptNo}</strong></div>
      </div>

      {/* Fields */}
      {[
        { label: 'Received from:', value: r.receivedFrom },
        { label: 'The Sum of:', value: words },
      ].map(({ label, value }) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 12 }}>{label}</span>
          <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 240, marginLeft: 6 }}>{value}</span>
        </div>
      ))}

      <div style={{ borderBottom: '1px solid #ccc', margin: '6px 0' }} />

      <div style={{ marginBottom: 14 }}>
        <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 12 }}>Being payment for:</span>
        <span style={{ borderBottom: '1px solid #555', display: 'inline-block', minWidth: 220, marginLeft: 6 }}>{r.paymentFor}</span>
      </div>

      <div style={{ borderBottom: '1px solid #ccc', marginBottom: 12 }} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ border: '1px solid #006400', minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '3px 8px', gap: 8 }}>
            <strong style={{ fontSize: 13 }}>N</strong>
            <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{amt > 0 ? amt.toLocaleString('en-NG') : ''}</span>
            <span>: K</span>
          </div>
          <div style={{ background: '#006400', color: 'white', padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>
            Cheque No: {r.chequeNo}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          {s.signature_url && <img src={s.signature_url} alt="Sig" style={{ height: 40, objectFit: 'contain', display: 'block', marginBottom: 2 }} />}
          <div style={{ borderTop: '1px solid #333', width: 130, textAlign: 'center', paddingTop: 3, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontSize: 12 }}>
            S i g n a t u r e
          </div>
        </div>
      </div>
    </div>
  )
})

export default function GenerateReceiptPage() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([empty()])
  const printRef = useRef<HTMLDivElement>(null)

  const { data: settingsData } = useSWR('/admin/settings', () => api.get<{ data: Settings }>('/admin/settings'))
  const settings: Settings = settingsData?.data ?? {}

  // Deferred so preview lags slightly behind typing — inputs stay snappy
  const deferred = useDeferredValue(receipts)

  function update(i: number, field: keyof ReceiptData) {
    return (val: string) => setReceipts(rs => rs.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  function print() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const w = window.open('', '_blank')!
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
      <style>body{margin:0;padding:12px;background:white;font-family:Arial,sans-serif;}
      @page{size:A4;margin:8mm 12mm;}.rw{page-break-inside:avoid;margin-bottom:12px;}
      </style></head><body>${content}</body></html>`)
    w.document.close()
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  return (
    <DashboardLayout title="Generate Receipt" requiredRole="admin">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <Link href="/admin/payments" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex gap-2">
            <button onClick={() => setReceipts(rs => [...rs, empty()])} className="btn btn-secondary btn-sm">
              <Plus className="h-4 w-4" /> Add receipt
            </button>
            <button onClick={print} className="btn btn-primary">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-4">
            <div className="page-header mb-0">
              <h2 className="page-title">Receipt Details</h2>
              <p className="page-subtitle">Preview updates as you type</p>
            </div>

            {receipts.map((r, i) => (
              <div key={i} className="card card-body space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Receipt {i + 1}</span>
                  {receipts.length > 1 && (
                    <button onClick={() => setReceipts(rs => rs.filter((_, j) => j !== i))} className="btn btn-ghost btn-sm" style={{ color: '#fca5a5' }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Receipt No." value={r.receiptNo} onChange={update(i, 'receiptNo')} placeholder="00/537" />
                  <Field label="Date" type="date" value={r.date} onChange={update(i, 'date')} />
                </div>
                <Field label="Received From" value={r.receivedFrom} onChange={update(i, 'receivedFrom')} placeholder="ABDULLAHI MUSA" />
                <Field label="Amount (₦)" type="number" value={r.amount} onChange={update(i, 'amount')} placeholder="10000" />
                <Field label="Being Payment For" value={r.paymentFor} onChange={update(i, 'paymentFor')} placeholder="DRIVERS TRAINING AND CERTIFICATION" />
                <Field label="Cheque No. (optional)" value={r.chequeNo} onChange={update(i, 'chequeNo')} />
              </div>
            ))}
          </div>

          {/* Preview */}
          <div>
            <div className="page-header mb-3">
              <h2 className="page-title">Preview</h2>
              <p className="page-subtitle">{receipts.length} receipt{receipts.length !== 1 ? 's' : ''} — A4 print</p>
            </div>
            <div ref={printRef} style={{ background: 'white', padding: 8 }}>
              {deferred.map((r, i) => (
                <div key={i} className="rw" style={{ marginBottom: 12 }}>
                  <ReceiptPreview r={r} s={settings} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
