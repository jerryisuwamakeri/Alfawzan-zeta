'use client'

import useSWR from 'swr'
import { Users, DollarSign, Clock, FileText, CreditCard, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, Avatar, Badge, PageLoader } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'

interface AdminDashData {
  stats: { total_users: number; total_revenue: number; pending_payments: number; paid_payments: number; total_documents: number; total_agents: number }
  monthly_revenue: Array<{ month: string; total: number }>
  recent_payments: Array<{ id: number; payment_reference: string; amount: string; status: string; created_at: string; user: { name: string; email: string } }>
  recent_users: Array<{ id: number; name: string; email: string; created_at: string }>
}

const TOOLTIP = {
  backgroundColor: '#111118',
  border: '1px solid #1f1f2e',
  borderRadius: 8,
  fontSize: 12,
  color: '#e4e4f0',
}

export default function AdminDashboard() {
  const { data, isLoading } = useSWR('/admin/dashboard', () => api.get<AdminDashData>('/admin/dashboard'))

  return (
    <DashboardLayout title="Dashboard" requiredRole="admin">
      {isLoading || !data ? (
        <PageLoader />
      ) : (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users"    value={data.stats.total_users}                     icon={<Users className="h-5 w-5" />}    color="primary" sub="Registered students" />
            <StatCard label="Total Revenue"  value={formatCurrency(data.stats.total_revenue)}   icon={<DollarSign className="h-5 w-5" />} color="emerald" sub="All time earnings" />
            <StatCard label="Pending"        value={data.stats.pending_payments}                icon={<Clock className="h-5 w-5" />}    color="amber"   sub="Awaiting processing" />
            <StatCard label="Documents"      value={data.stats.total_documents}                 icon={<FileText className="h-5 w-5" />} color="sky"     sub="Available files" />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Revenue chart */}
            <div className="lg:col-span-2 card card-body">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-4 w-4" style={{ color: '#a5b4fc' }} />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Revenue</h3>
                  <p className="text-xs" style={{ color: 'var(--text-2)' }}>Last 12 months</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.monthly_revenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5c5c78' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#5c5c78' }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2}
                    fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Payment status */}
            <div className="card card-body">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="h-4 w-4" style={{ color: '#6ee7b7' }} />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Payment Status</h3>
                  <p className="text-xs" style={{ color: 'var(--text-2)' }}>Distribution</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: data.stats.paid_payments },
                      { name: 'Pending', value: data.stats.pending_payments },
                    ]}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                    paddingAngle={3} dataKey="value"
                  >
                    {['#10b981', '#f59e0b'].map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={7}
                    wrapperStyle={{ fontSize: 11, color: '#8b8ba8' }} />
                  <Tooltip contentStyle={TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <p className="text-lg font-semibold" style={{ color: '#6ee7b7' }}>{data.stats.paid_payments}</p>
                  <p className="text-xs" style={{ color: '#6ee7b7', opacity: 0.6 }}>Paid</p>
                </div>
                <div className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <p className="text-lg font-semibold" style={{ color: '#fcd34d' }}>{data.stats.pending_payments}</p>
                  <p className="text-xs" style={{ color: '#fcd34d', opacity: 0.6 }}>Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent tables */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent Payments */}
            <div className="card">
              <div className="card-header">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Payments</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Latest transactions</p>
              </div>
              <table className="table">
                <thead><tr><th>User</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recent_payments.slice(0, 6).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={p.user.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.user.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(p.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium" style={{ color: '#6ee7b7' }}>{formatCurrency(p.amount)}</td>
                      <td><Badge label={p.status} color={statusColor(p.status)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Users */}
            <div className="card">
              <div className="card-header">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Users</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>New registrations</p>
              </div>
              <table className="table">
                <thead><tr><th>Student</th><th>Email</th><th>Joined</th></tr></thead>
                <tbody>
                  {data.recent_users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.name} size="sm" />
                          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-2)' }}>{u.email}</td>
                      <td className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
