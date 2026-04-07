'use client'

import { motion } from 'framer-motion'
import Icon from '@/components/ui/Icon'
import { cardVariants } from '@/lib/animations'
import type { CardState, EnvironmentData } from '@/lib/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AtmosphericCardProps {
  cardState: CardState
  env: EnvironmentData
}

const POLLEN_COLORS = {
  low: 'text-secondary',
  medium: 'text-yellow-600',
  high: 'text-primary',
  extreme: 'text-error',
}

const POLLEN_BG = {
  low: 'bg-secondary/10',
  medium: 'bg-yellow-50',
  high: 'bg-primary/10',
  extreme: 'bg-error/10',
}

function PollenBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = value < 30 ? 'bg-secondary' : value < 60 ? 'bg-yellow-500' : 'bg-primary'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-on-surface-variant w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="text-xs font-semibold text-on-surface w-6 text-right">{value}</span>
    </div>
  )
}

export default function AtmosphericCard({ cardState, env }: AtmosphericCardProps) {
  const { status } = cardState
  const pollenColor = POLLEN_COLORS[env.pollenLevel]
  const pollenBg = POLLEN_BG[env.pollenLevel]

  return (
    <motion.div
      animate={status}
      variants={cardVariants}
      className="rounded-lg p-6 border-2 border-transparent shadow-card h-full flex flex-col gap-5"
      style={{ backgroundColor: 'rgba(227, 232, 243, 1)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
            Atmospheric Intelligence
          </p>
          <h3 className="text-lg font-bold text-on-surface leading-tight">{cardState.message}</h3>
        </div>
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', pollenBg)}>
          <Icon
            name={status === 'safe' ? 'air' : 'grass'}
            filled
            size={22}
            className={pollenColor}
          />
        </div>
      </div>

      {/* AQI + Pollen level */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white/60 rounded p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">AQI</p>
          <p className={cn('text-3xl font-extrabold', env.aqi < 100 ? 'text-secondary' : env.aqi < 200 ? 'text-yellow-600' : 'text-error')}>
            {env.aqi}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {env.aqi < 50 ? 'Good' : env.aqi < 100 ? 'Moderate' : env.aqi < 150 ? 'Unhealthy for sensitive' : 'Unhealthy'}
          </p>
        </div>
        <div className="flex-1 bg-white/60 rounded p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Pollen</p>
          <p className={cn('text-3xl font-extrabold capitalize', pollenColor)}>{env.pollenLevel}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">{env.city}</p>
        </div>
      </div>

      {/* Pollen breakdown */}
      <div className="bg-white/60 rounded p-4 flex flex-col gap-2.5">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Pollen Breakdown</p>
        <PollenBar label="Grass" value={env.pollenTypes.grass} />
        <PollenBar label="Tree" value={env.pollenTypes.tree} />
        <PollenBar label="Weed" value={env.pollenTypes.weed} />
        <PollenBar label="Ragweed" value={env.pollenTypes.ragweed} />
      </div>

      {/* CTA */}
      {cardState.actionable && cardState.action && (
        <Link
          href={cardState.action.href}
          className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Icon name="medication" filled size={16} />
          {cardState.action.label}
        </Link>
      )}
    </motion.div>
  )
}
