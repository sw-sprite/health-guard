'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Icon from '@/components/ui/Icon'
import NotificationDropdown from './NotificationDropdown'
import type { Notification, UserProfile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TopNavBarProps {
  user: UserProfile
  notifications: Notification[]
  onMarkRead: (id: string) => void
}

const NAV_LINKS = [
  { href: '/status', label: 'Status', icon: 'monitor_heart' },
  { href: '/log', label: 'Log', icon: 'edit_note' },
  { href: '/trends', label: 'Trends', icon: 'trending_up' },
]

export default function TopNavBar({ user, notifications, onMarkRead }: TopNavBarProps) {
  const pathname = usePathname()
  const [notifOpen, setNotifOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-white/80 backdrop-blur-xl shadow-navbar">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/status" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="shield_with_heart" filled size={18} className="text-white" />
          </div>
          <span className="font-bold text-on-surface tracking-tight">Health Guard</span>
        </Link>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-surface-container text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                )}
              >
                <Icon name={link.icon} filled={active} size={18} />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 hover:bg-surface-container-low rounded-lg transition-all"
              aria-label="Notifications"
            >
              <Icon name="notifications" filled={notifOpen} size={22} className="text-on-surface-variant" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <NotificationDropdown
                notifications={notifications}
                onMarkRead={onMarkRead}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="p-2 hover:bg-surface-container-low rounded-lg transition-all"
            aria-label="Settings"
          >
            <Icon name="settings" size={22} className="text-on-surface-variant" />
          </Link>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-secondary text-xs font-bold">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-around mt-2 pt-2 border-t border-surface-container">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs font-medium transition-all',
                active ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              <Icon name={link.icon} filled={active} size={22} />
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
