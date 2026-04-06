'use client'

import { motion } from 'framer-motion'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/components/providers/AppProvider'
import { format, subDays } from 'date-fns'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function TrendsPage() {
  const { logs } = useApp()

  // Build last-7-days chart data
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayLogs = logs.filter((l) => {
      const d = new Date(l.loggedAt)
      return d.toDateString() === date.toDateString()
    })
    return { date, count: dayLogs.length, label: format(date, 'EEE') }
  })
  const maxCount = Math.max(...days.map((d) => d.count), 1)

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
            Health Trends
          </p>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Your Trends</h1>
        </motion.div>

        {/* 7-day medication chart */}
        <motion.div variants={staggerItem} className="bg-surface-container-low rounded-xl p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
            Medication Logs — Last 7 Days
          </p>
          <div className="flex items-end gap-3 h-32">
            {days.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full bg-primary/80 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={{ height: d.count === 0 ? 4 : `${(d.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  style={{ minHeight: d.count === 0 ? '4px' : undefined }}
                />
                <span className="text-xs text-on-surface-variant">{d.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Coming soon panels */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'bedtime', label: 'Sleep Tracking', desc: 'Average sleep duration and quality score.' },
            { icon: 'favorite', label: 'Pollen Exposure', desc: 'Cumulative pollen exposure over time.' },
            { icon: 'directions_run', label: 'Activity', desc: 'Active hours and outdoor time correlation.' },
          ].map((card) => (
            <div key={card.label} className="bg-surface-container-low rounded-xl p-5 shadow-card flex flex-col gap-3">
              <div className="p-2.5 bg-secondary/10 rounded-xl w-fit">
                <Icon name={card.icon} filled size={22} className="text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">{card.label}</p>
                <p className="text-xs text-on-surface-variant mt-1">{card.desc}</p>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest">
                Phase 2
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
