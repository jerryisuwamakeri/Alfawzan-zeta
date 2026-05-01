'use client'

import useSWR from 'swr'
import { Link2, DollarSign, CreditCard, ExternalLink } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, EmptyState, PageLoader, Badge } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface AgentDashData {
  stats: { total_links: number; total_payments: number; total_revenue: number }
  links: Array<{ id: number; name: string; full_url: string; is_active: boolean; payments_count: number; revenue: number }>
}

export default function AgentDashboard() {
  const { data, isLoading } = useSWR('/agent/dashboard', () => api.get<AgentDashData>('/agent/dashboard'))

  return (
    <DashboardLayout title="Agent Dashboard" requiredRole="agent">
      {isLoading || !data ? (
        <PageLoader />
      ) : (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="My Links"      value={data.stats.total_links}                    icon={<Link2 className="h-5 w-5" />}     color="primary" sub="Active agent links" />
            <StatCard label="Total Payments" value={data.stats.total_payments}                 icon={<CreditCard className="h-5 w-5" />} color="sky"     sub="Via my links" />
            <StatCard label="Total Revenue"  value={formatCurrency(data.stats.total_revenue)}  icon={<DollarSign className="h-5 w-5" />} color="emerald" sub="Collected" />
          </div>

          {/* Links table */}
          <div className="card">
            <div className="card-header">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>My Payment Links</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Share these links with students to collect payments</p>
            </div>
            {data.links.length === 0 ? (
              <EmptyState
                icon={<Link2 className="h-7 w-7" />}
                title="No links assigned"
                description="Contact your admin to get payment links assigned to you."
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Payments</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.links.map((l) => (
                    <tr key={l.id}>
                      <td className="font-medium" style={{ color: 'var(--text)' }}>{l.name}</td>
                      <td>
                        <a
                          href={l.full_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs hover:underline"
                          style={{ color: '#a5b4fc' }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          {l.full_url.replace(/^https?:\/\//, '').slice(0, 40)}
                        </a>
                      </td>
                      <td>
                        <Badge
                          label={l.is_active ? 'Active' : 'Inactive'}
                          color={l.is_active
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                            : 'bg-red-900/40 text-red-400 border border-red-800/50'}
                        />
                      </td>
                      <td>
                        <span
                          className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                          style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
                        >
                          {l.payments_count}
                        </span>
                      </td>
                      <td className="font-medium" style={{ color: '#6ee7b7' }}>{formatCurrency(l.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
