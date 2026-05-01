'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck, Award, Phone, CreditCard, FileText,
  Receipt, Users, CheckCircle, ArrowRight, MapPin,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { usePublicSettings } from '@/hooks/usePublicSettings'

function SchoolLogo({ className = '', height = 40 }: { className?: string; height?: number }) {
  const { logo_url, school_name } = usePublicSettings()
  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt={school_name || 'Alfawzan Driving School'}
        style={{ height, objectFit: 'contain' }}
        className={className}
      />
    )
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-sm shrink-0">
        AF
      </div>
      <span className="font-semibold" style={{ color: 'var(--text)' }}>
        {school_name || 'Alfawzan Driving School'}
      </span>
    </div>
  )
}

export default function Home() {
  const s = usePublicSettings()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/">
            <SchoolLogo height={36} />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="btn btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn btn-primary text-sm">Enroll now</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-5 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                <ShieldCheck className="h-3 w-3" /> FRSC &amp; KASTLEA Accredited
              </span>

              {/* Big logo in hero */}
              {s.logo_url && (
                <div className="mb-6">
                  <img src={s.logo_url} alt={s.school_name || 'Alfawzan'} style={{ height: 80, objectFit: 'contain' }} />
                </div>
              )}

              <h1 className="text-4xl font-bold leading-[1.15] sm:text-5xl" style={{ color: 'var(--text)' }}>
                {s.school_name || 'Al-Fawzan Driving School'}
                <br />
                <span style={{ color: '#6366f1' }}>Learn. Drive. Excel.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {s.tagline || 'A fully licensed road safety training institution delivering professional driver education across Nigeria.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn btn-secondary btn-lg">Sign in</Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ShieldCheck, label: 'FRSC Licensed',      sub: 'Federal Road Safety Corps' },
                { icon: Award,       label: 'KASTLEA Certified',  sub: 'State Quality Assured' },
                { icon: Users,       label: '5 Programs',         sub: 'Training courses offered' },
                { icon: Phone,       label: s.phone || '+234 803 848 2622', sub: 'Reach us anytime' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <Icon className="h-5 w-5 mb-3" style={{ color: '#6366f1' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* Programs */}
      <section className="px-6 py-20" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Training Programs</h2>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--text-2)' }}>Structured courses for every driver at every level</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Learner Driver Training',   desc: 'Comprehensive training for new drivers covering safe driving practices and road regulations.' },
              { title: 'Professional / Commercial', desc: 'Specialized training for commercial drivers with industry-standard certification programs.' },
              { title: 'Defensive & Advanced',      desc: 'Advanced techniques and defensive strategies for experienced drivers.' },
              { title: 'Refresher Courses',         desc: 'Update your driving knowledge and skills with comprehensive refresher courses.' },
              { title: 'Fleet Driver Management',   desc: 'Corporate solutions for fleet management, training, and consultancy services.' },
              { title: 'Road Safety Training',      desc: 'Comprehensive road safety awareness programs aligned with FRSC standards.' },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <CheckCircle className="h-4 w-4 mb-3" style={{ color: '#6366f1' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Platform Features</h2>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--text-2)' }}>Everything you need, in one place</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: CreditCard, title: 'Easy Payments',    desc: 'Pay online via Paystack or use admin-issued reference IDs.',   color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)' },
              { icon: FileText,   title: 'Document Access',  desc: 'Download your certificates and training materials anytime.',    color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)' },
              { icon: Receipt,    title: 'Instant Receipts', desc: 'Auto-generated PDF receipts after every successful payment.',   color: '#fcd34d', bg: 'rgba(245,158,11,0.1)'  },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: bg, color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* CTA */}
      <section className="px-6 py-16" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Ready to get started?</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Join hundreds of students at Alfawzan Driving School.</p>
          </div>
          <Link href="/register" className="btn btn-primary btn-lg shrink-0">
            Enroll Today <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="mb-3">
                <SchoolLogo height={48} />
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
                Driving Knowledge, Building Confidence &amp; Ensuring Safety.
                FRSC &amp; KASTLEA accredited institution.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Navigation</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Contact</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
                {s.phone  && <li className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{s.phone}</li>}
                {s.phone2 && <li className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{s.phone2}</li>}
                {s.address && <li className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />{s.address}</li>}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}>
            <p>© {new Date().getFullYear()} {s.school_name || 'Alfawzan Driving School Ltd.'}. All rights reserved.</p>
            <p>Built by <a href="https://makeriweblinks.com.ng" target="_blank" className="hover:text-white transition-colors">Makeri Weblinks Technologies</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
