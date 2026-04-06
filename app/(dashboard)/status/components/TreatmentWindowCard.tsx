'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import { cardVariants } from '@/lib/animations'
import type { CardState, MedicationLog, Medication } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface TreatmentWindowCardProps {
  cardState: CardState
  logs: MedicationLog[]
  medications: Medication[]
}

const STATUS_ICON = {
  safe: { name: 'check_circle', color: 'text-secondary', bg: 'bg-secondary/10' },
  warning: { name: 'schedule', color: 'text-primary', bg: 'bg-primary/10' },
  critical: { name: 'error', color: 'text-error', bg: 'bg-error/10' },
}

export default function TreatmentWindowCard({ cardState, logs, medications }: TreatmentWindowCardProps) {
  const { status } = cardState
  const iconCfg = STATUS_ICON[status]
  const primaryMed = medications[0]
  const lastLog = logs
    .filter((l) => l.medicationId === primaryMed?.id)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())[0]

  return (
    <motion.div
      animate={status}
      variants={cardVariants}
      className="rounded-xl p-6 border-2 border-transparent shadow-card h-full flex flex-col gap-4"
      style={{ backgroundColor: 'rgba(227, 232, 243, 1)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
            Treatment Window
          </p>
          <h3 className="text-base font-bold text-on-surface leading-snug max-w-[180px]">
            {cardState.message}
          </h3>
        </div>
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', iconCfg.bg)}>
          <Icon name={iconCfg.name} filled size={22} className={iconCfg.color} />
        </div>
      </div>

      {/* Medication info */}
      {primaryMed && (
        <div className="bg-white/60 rounded-xl p-4 flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Primary Medication</p>
          <p className="font-semibold text-on-surface">{primaryMed.name}</p>
          <p className="text-xs text-on-surface-variant">{primaryMed.dosage} · every {primaryMed.frequencyHours}h</p>
        </div>
      )}

      {/* Last dose */}
      <div className="bg-white/60 rounded-xl p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Last Dose</p>
        {lastLog ? (
          <>
            <p className="font-semibold text-on-surface text-sm">
              {formatDistanceToNow(new Date(lastLog.loggedAt), { addSuffix: true })}
            </p>
            {lastLog.notes && (
              <p className="text-xs text-on-surface-variant mt-0.5">{lastLog.notes}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-on-surface-variant">No doses logged yet</p>
        )}
      </div>

      {/* CTA */}
      {cardState.actionable && cardState.action && (
        <Link
          href={cardState.action.href}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm active:scale-95 transition-all',
            status === 'critical'
              ? 'bg-error text-white hover:bg-error/90'
              : 'bg-primary text-white hover:bg-primary/90'
          )}
        >
          <Icon name="medication" filled size={16} />
          {cardState.action.label}
        </Link>
      )}
    </motion.div>
  )
}
