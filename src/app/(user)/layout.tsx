import DashboardLayout from '@/components/layout/DashboardLayout'

// Each page passes title via searchParams; we intercept via children wrapper
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
