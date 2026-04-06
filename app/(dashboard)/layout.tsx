import AppProvider from '@/components/providers/AppProvider'
import DashboardShell from '@/components/shared/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppProvider>
  )
}
