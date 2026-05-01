'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { api } from '@/lib/api'
import { usePublicSettings } from '@/hooks/usePublicSettings'

interface Reg {
  id: number; full_name: string; first_name: string; surname: string; othername: string
  mothers_maiden_name: string; gender: string; date_of_birth: string; blood_group: string
  facial_mark: boolean; height: string; requires_glasses: boolean; has_disability: boolean
  disability_details: string; next_of_kin_phone: string; nin_number: string
  marital_status: string; email: string; phone: string; address: string
  state_of_origin: string; local_govt: string; license_type: string
  additional_info: string; passport_url?: string; created_at: string
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PrintRegistrationPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useSWR(`/driving-school/register/${id}`,
    () => api.get<{ data: Reg }>(`/driving-school/register/${id}`)
  )
  const { logo_url, school_name, address, phone, phone2 } = usePublicSettings()

  const r = data?.data
  const displayName = school_name || 'ALFAWZAN DRIVING SCHOOL LIMITED'
  const displayAddress = address || 'ADDRESS: FF16 ZAMZAM PLAZA, OPPOSITE AA RANO FILLING STATION, KASUWAR BARCHI, TUDUN WADA, KADUNA'
  const displayPhone = [phone, phone2].filter(Boolean).join(', ') || '07062020506, 08038482622, 08024253755'

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <p style={{ color: '#555' }}>Loading registration form...</p>
    </div>
  )
  if (!r) return (
    <div className="flex h-screen items-center justify-center">
      <p style={{ color: '#555' }}>Registration not found.</p>
    </div>
  )

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { margin: 0; padding: 0; box-shadow: none !important; }
        }
        body { background: #f0f0f0; font-family: Arial, Helvetica, sans-serif; }
        .page { background: white; max-width: 210mm; margin: 20px auto; padding: 20px 24px; box-shadow: 0 2px 16px rgba(0,0,0,0.12); }
        .school-header { text-align: center; border-bottom: 3px solid #006400; padding-bottom: 10px; margin-bottom: 14px; position: relative; }
        .school-name-big { font-size: 28px; font-weight: 900; color: #006400; letter-spacing: 1px; text-transform: uppercase; }
        .school-address { font-size: 11px; color: #333; margin: 2px 0; }
        .form-title { display: inline-block; background: #111; color: white; padding: 5px 24px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 8px auto; font-weight: bold; }
        .logo-badge { position: absolute; right: 0; top: 0; width: 80px; text-align: center; border: 1px solid #006400; padding: 4px; }
        .logo-badge-name { font-family: 'Times New Roman', serif; font-style: italic; font-size: 13px; color: #006400; font-weight: bold; }
        .logo-badge-sub { font-size: 8px; font-weight: bold; color: #006400; text-transform: uppercase; letter-spacing: 0.5px; }
        .logo-badge-addr { font-size: 6px; color: #333; }
        .section-title { font-size: 11px; font-weight: bold; text-decoration: underline; margin: 10px 0 6px; text-transform: uppercase; }
        .field-row { display: flex; align-items: baseline; margin: 6px 0; font-size: 11px; }
        .field-label { color: #444; white-space: nowrap; margin-right: 4px; min-width: 160px; }
        .field-value { font-weight: bold; font-size: 13px; border-bottom: 1px dotted #999; flex: 1; min-width: 80px; padding-bottom: 1px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
        .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 12px; }
        .passport-box { position: absolute; right: 0; top: 0; width: 90px; height: 110px; border: 1px solid #999; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #999; text-align: center; overflow: hidden; }
        .bio-section { position: relative; padding-right: 100px; }
        .agreement-text { font-size: 10px; line-height: 1.6; margin: 8px 0; }
        .agreement-list { font-size: 10px; padding-left: 18px; }
        .agreement-list li { margin: 2px 0; }
        .sign-row { display: flex; justify-content: space-between; margin-top: 16px; font-size: 11px; }
        .sign-line { border-top: 1px solid #333; width: 140px; text-align: center; padding-top: 3px; }
        .note-box { margin-top: 12px; font-size: 10px; border-top: 1px solid #ccc; padding-top: 8px; text-align: center; }
        .check-box { display: inline-block; width: 11px; height: 11px; border: 1px solid #333; margin-right: 3px; vertical-align: middle; text-align: center; line-height: 11px; font-size: 9px; }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto', padding: '12px 0', display: 'flex', gap: 8 }}>
        <button
          onClick={() => window.print()}
          style={{ background: '#006400', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{ background: '#eee', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          Close
        </button>
      </div>

      <div className="page print-page">
        {/* School Header */}
        <div className="school-header">
          {logo_url
            ? <img src={logo_url} alt={displayName} style={{ height: 80, objectFit: 'contain', marginBottom: 6 }} />
            : <div className="school-name-big">{displayName}</div>
          }
          {logo_url && (
            <div className="school-name-big" style={{ fontSize: 20 }}>{displayName}</div>
          )}
          <div className="school-address">{displayAddress}</div>
          <div className="school-address"><strong>Contact: {displayPhone}</strong></div>
          <div className="form-title">REGISTRATION FORM</div>
          <div className="logo-badge">
            {logo_url
              ? <img src={logo_url} alt={displayName} style={{ width: '100%', objectFit: 'contain' }} />
              : <>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#006400', lineHeight: 1 }}>AF</div>
                  <div className="logo-badge-name">Al-Fawzan</div>
                  <div className="logo-badge-sub">DRIVING SCHOOL LIMITED</div>
                </>
            }
            <div className="logo-badge-addr">{displayAddress}</div>
            <div className="logo-badge-addr">{displayPhone}</div>
          </div>
        </div>

        {/* Section A */}
        <div className="section-title">SECTION A: BIO DATA</div>
        <div className="bio-section">
          {/* Passport photo box */}
          <div className="passport-box">
            {r.passport_url
              ? <img src={r.passport_url} alt="Passport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>Passport Photo</span>
            }
          </div>

          <div className="field-row">
            <span className="field-label">NAME</span>
            <span className="field-value">{`${r.first_name} ${r.othername || ''} ${r.surname}`.trim()}</span>
          </div>
          <div className="grid2">
            <div className="field-row">
              <span className="field-label">MOTHER&rsquo;s MAIDEN NAME</span>
              <span className="field-value">{r.mothers_maiden_name || ''}</span>
            </div>
            <div className="field-row">
              <span className="field-label">GENDER</span>
              <span className="field-value">{r.gender || ''}</span>
            </div>
          </div>
          <div className="grid2">
            <div className="field-row">
              <span className="field-label">DATE OF BIRTH</span>
              <span className="field-value">{formatDate(r.date_of_birth)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">LICENCE CLASS</span>
              <span className="field-value">{r.license_type || ''}</span>
            </div>
          </div>
          <div className="field-row" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span><span className="field-label">BLOOD GROUP</span> <span className="field-value" style={{ minWidth: 40 }}>{r.blood_group || ''}</span></span>
            <span><span className="field-label">FACIAL MARK</span> <span className="field-value" style={{ minWidth: 30 }}>{r.facial_mark ? 'Yes' : 'No'}</span></span>
            <span>
              <span className="field-label">MARITAL STATUS:</span>{' '}
              <span className="check-box">{r.marital_status === 'Married' ? '✓' : ''}</span>MARRIED{' '}
              <span className="check-box">{r.marital_status === 'Single' ? '✓' : ''}</span>SINGLE{' '}
              <span className="check-box">{r.marital_status === 'Divorced' ? '✓' : ''}</span>DIVORCED
            </span>
          </div>
          <div className="grid2">
            <div className="field-row">
              <span className="field-label">DO YOU REQUIRE GLASSES</span>
              <span className="field-value">{r.requires_glasses ? 'Yes' : 'No'}</span>
            </div>
            <div className="field-row">
              <span className="field-label">HEIGHT</span>
              <span className="field-value">{r.height ? `${r.height}M` : ''}</span>
            </div>
          </div>
          <div className="field-row">
            <span className="field-label">ANY FORM OF DISABILITY?</span>
            <span className="field-value">{r.has_disability ? 'Yes' : 'No'}</span>
            {r.has_disability && r.disability_details && (
              <><span className="field-label" style={{ marginLeft: 8 }}>IF YES EXPLAIN</span>
              <span className="field-value">{r.disability_details}</span></>
            )}
          </div>
          <div className="grid2">
            <div className="field-row">
              <span className="field-label">NEXT OF KIN PHONE NUMBER</span>
              <span className="field-value">{r.next_of_kin_phone || ''}</span>
            </div>
            <div className="field-row">
              <span className="field-label">NIN NUMBER</span>
              <span className="field-value">{r.nin_number || ''}</span>
            </div>
          </div>
          <div className="grid3">
            <div className="field-row">
              <span className="field-label">NATIONALITY</span>
              <span className="field-value">NIGERIA</span>
            </div>
            <div className="field-row">
              <span className="field-label">STATE OF ORIGIN</span>
              <span className="field-value">{r.state_of_origin || 'Kaduna'}</span>
            </div>
            <div className="field-row">
              <span className="field-label">L.G.A.</span>
              <span className="field-value">{r.local_govt || ''}</span>
            </div>
          </div>
        </div>

        {/* Section B */}
        <div className="section-title">SECTION B: CONTACT DETAILS</div>
        <div className="field-row">
          <span className="field-label">PERMANENT HOME ADDRESS</span>
          <span className="field-value">{r.address || ''}</span>
        </div>
        <div className="grid2">
          <div className="field-row">
            <span className="field-label">CITY</span>
            <span className="field-value">KADUNA</span>
          </div>
          <div className="field-row">
            <span className="field-label">STATE</span>
            <span className="field-value">{r.state_of_origin || 'Kaduna'}</span>
          </div>
        </div>
        <div className="field-row">
          <span className="field-label">EMAIL ADDRESS</span>
          <span className="field-value" style={{ fontSize: 11, wordBreak: 'break-all' }}>{r.email || ''}</span>
        </div>
        <div className="field-row">
          <span className="field-label">PHONE NUMBER</span>
          <span className="field-value">{r.phone || ''}</span>
        </div>

        {/* Section C */}
        <div className="section-title">SECTION C AGREEMENT</div>
        <div className="agreement-text">
          I <strong>{`${r.first_name} ${r.othername || ''} ${r.surname}`.trim()}</strong> do hereby agree that:
        </div>
        <ol className="agreement-list">
          <li>I will be punctual in attending the training course.</li>
          <li>I will co-operate and respect the management of the above-named driving institute during the period of my training.</li>
          <li>I do agree that there is no refund of money after payment.</li>
          <li>I will bear the cost of repairs of any vehicle damage/having accident during my training.</li>
          <li>I am expected to complete my training within 30 DAYS from the date of registration.</li>
          <li>I will be regular in attending my training on the agreed time every day.</li>
          <li>Any arrangement without the consent of management is at your own risk.</li>
        </ol>

        <div className="sign-row">
          <span>SIGN ................................ ........</span>
          <span>DATE........<strong>{formatDate(r.created_at)}</strong>....</span>
        </div>

        <div className="note-box">
          <strong>NOTE:</strong> Failure to keep to your stipulate training time as indicated in your form will not be recorded by the instructor<br />
          <strong>(Registration Form N500 only)</strong>
        </div>

        <div className="sign-row" style={{ marginTop: 20 }}>
          <div className="sign-line">Registered by</div>
          <div className="sign-line">Instructor in charge</div>
        </div>
      </div>
    </>
  )
}
