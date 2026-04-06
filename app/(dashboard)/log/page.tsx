'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/components/providers/AppProvider'
import { formatDistanceToNow } from 'date-fns'
import Icon from '@/components/ui/Icon'
import { staggerContainer, staggerItem } from '@/lib/animations'
import type { LogType } from '@/lib/types'
import { cn } from '@/lib/utils'

const QUICK_LOGS: { id: LogType; label: string; icon: string; color: string; bg: string; border: string }[] = [
  { id: 'medication', label: 'Medicine', icon: 'medication', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  { id: 'hydration', label: 'Hydration', icon: 'water_drop', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  { id: 'exercise', label: 'Exercise', icon: 'fitness_center', color: 'text-tertiary', bg: 'bg-tertiary/10', border: 'border-tertiary/20' },
]

const LOG_TYPE_CONFIG: Record<LogType, { icon: string; color: string; bg: string }> = {
  medication: { icon: 'medication', color: 'text-primary', bg: 'bg-primary/10' },
  hydration:  { icon: 'water_drop', color: 'text-secondary', bg: 'bg-secondary/10' },
  exercise:   { icon: 'fitness_center', color: 'text-tertiary', bg: 'bg-tertiary/10' },
  note:       { icon: 'edit_note', color: 'text-on-surface-variant', bg: 'bg-surface-container-high' },
}

export default function LogPage() {
  const { user, logs, addLog } = useApp()
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const primaryMed = user.profile.medications[0]

  function showSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function handleQuickLog(type: LogType) {
    setIsSubmitting(true)

    if (type === 'medication' && primaryMed) {
      await addLog({ type: 'medication', medicationId: primaryMed.id, medicationName: `${primaryMed.name} ${primaryMed.dosage}`, notes: notes.trim() || undefined })
      showSuccess(`${primaryMed.name} dose logged!`)
    } else if (type === 'hydration') {
      await addLog({ type: 'hydration', medicationName: 'Hydration', notes: notes.trim() || undefined })
      showSuccess('Hydration logged!')
    } else {
      await addLog({ type: 'exercise', medicationName: 'Exercise', notes: notes.trim() || undefined })
      showSuccess('Exercise logged!')
    }

    setNotes('')
    setIsSubmitting(false)
  }

  async function handleTextLog() {
    if (!notes.trim()) return
    setIsSubmitting(true)

    const lower = notes.toLowerCase()
    const isMed =
      primaryMed &&
      (lower.includes(primaryMed.name.toLowerCase()) ||
        /\d+\s*mg/i.test(notes) ||
        ['pill', 'tablet', 'capsule', 'dose', 'supplement'].some((k) => lower.includes(k)))

    if (isMed && primaryMed) {
      await addLog({ type: 'medication', medicationId: primaryMed.id, medicationName: `${primaryMed.name} ${primaryMed.dosage}`, notes: notes.trim() })
      showSuccess('Medication dose logged!')
    } else {
      const label = notes.trim().slice(0, 40) + (notes.trim().length > 40 ? '…' : '')
      await addLog({ type: 'note', medicationName: label, notes: notes.trim() })
      showSuccess('Note logged!')
    }

    setNotes('')
    setIsSubmitting(false)
  }

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .slice(0, 10)

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
            Medication & Activity Log
          </p>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Log Entry</h1>
        </motion.div>

        {/* Success toast */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-3.5 bg-secondary/10 border border-secondary/30 rounded-xl"
          >
            <Icon name="check_circle" filled size={20} className="text-secondary" />
            <p className="text-sm font-semibold text-secondary">{success}</p>
          </motion.div>
        )}

        {/* Text input */}
        <motion.div variants={staggerItem} className="bg-surface-container-low rounded-xl overflow-hidden shadow-card">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type anything — 'took my cetirizine', 'had 2 glasses of water', 'went for a run'..."
            className="w-full bg-transparent px-6 py-5 text-on-surface placeholder:text-on-surface-variant/50 text-base resize-none outline-none leading-relaxed min-h-[120px]"
            rows={4}
          />
          <div className="flex items-center justify-between px-6 py-3 border-t border-surface-container">
            <p className="text-xs text-on-surface-variant/50">
              {notes.length > 0 ? `${notes.length} chars` : 'Free-form logging'}
            </p>
            <button
              onClick={handleTextLog}
              disabled={!notes.trim() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-on-surface text-surface rounded-full text-sm font-semibold disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
            >
              <Icon name="send" filled size={14} />
              Log
            </button>
          </div>
        </motion.div>

        {/* Quick log cards */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Quick Log</p>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_LOGS.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuickLog(q.id)}
                disabled={isSubmitting}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50',
                  q.bg, q.border
                )}
              >
                <Icon name={q.icon} filled size={28} className={q.color} />
                <span className={cn('text-sm font-semibold', q.color)}>{q.label}</span>
                {q.id === 'medication' && primaryMed && (
                  <span className="text-xs text-on-surface-variant text-center leading-tight">
                    {primaryMed.name} {primaryMed.dosage}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Recent Activity</p>
          <div className="flex flex-col gap-2">
            {recentLogs.length === 0 && (
              <p className="text-sm text-on-surface-variant py-4 text-center">
                No logs yet — log your first entry above!
              </p>
            )}
            {recentLogs.map((log) => {
              const cfg = LOG_TYPE_CONFIG[log.type ?? 'medication']
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 px-5 py-4 bg-surface-container-low rounded-xl"
                >
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon name={cfg.icon} filled size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{log.medicationName}</p>
                    {log.notes && (
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">{log.notes}</p>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant/60 shrink-0">
                    {formatDistanceToNow(new Date(log.loggedAt), { addSuffix: true })}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
