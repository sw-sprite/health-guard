'use client'

import { useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Icon from '@/components/ui/Icon'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onClose: () => void
}

const TYPE_CONFIG = {
  info: { icon: 'info', color: 'text-secondary' },
  warning: { icon: 'warning', color: 'text-primary' },
  critical: { icon: 'emergency', color: 'text-error' },
}

export default function NotificationDropdown({
  notifications,
  onMarkRead,
  onClose,
}: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-xl shadow-card-hover border border-surface-container-high overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-surface-container flex items-center justify-between">
        <span className="font-semibold text-sm text-on-surface">Notifications</span>
        <span className="text-xs text-on-surface-variant">
          {notifications.filter((n) => !n.read).length} unread
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-on-surface-variant">
            No notifications
          </div>
        ) : (
          notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type]
            return (
              <button
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={cn(
                  'w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container-low transition-colors border-b border-surface-container last:border-0',
                  !notif.read && 'bg-surface-container-low/50'
                )}
              >
                <Icon name={config.icon} filled size={20} className={cn('mt-0.5 shrink-0', config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium text-on-surface', !notif.read && 'font-semibold')}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
