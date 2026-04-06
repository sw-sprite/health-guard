'use client'

import TopNavBar from './TopNavBar'
import { useApp } from '@/components/providers/AppProvider'
import Icon from '@/components/ui/Icon'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, notifications, markNotificationRead, isLoading } = useApp()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon name="shield_with_heart" filled size={24} className="text-primary" />
          </div>
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <>
      <TopNavBar
        user={user.profile}
        notifications={notifications}
        onMarkRead={markNotificationRead}
      />
      <main className="pt-16 md:pt-14 min-h-screen bg-background">
        {children}
      </main>
    </>
  )
}
