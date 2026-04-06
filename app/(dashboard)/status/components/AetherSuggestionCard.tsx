'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import type { CardStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AetherSuggestionCardProps {
  status: CardStatus | 'safe'
}

const CONFIG = {
  safe: {
    bg: 'bg-secondary/10',
    iconBg: 'bg-secondary/20',
    iconColor: 'text-secondary',
    title: 'Health Guard Assistant',
    suggestions: [
      { icon: 'directions_walk', text: 'Low pollen today — great time for a 30-min walk.' },
      { icon: 'window', text: 'Air quality excellent. Consider airing out your home.' },
    ],
    cta: { label: 'Plan a Walk', href: '/log', variant: 'secondary' as const },
  },
  warning: {
    bg: 'bg-primary/8',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    title: 'Health Guard Assistant',
    suggestions: [
      { icon: 'window', text: 'Keep windows closed — high pollen outside.' },
      { icon: 'air_purifier', text: 'Run your air purifier on max for the next few hours.' },
    ],
    cta: { label: 'Log Medication', href: '/log', variant: 'primary' as const },
  },
  critical: {
    bg: 'bg-error/8',
    iconBg: 'bg-error/15',
    iconColor: 'text-error',
    title: 'Health Guard Assistant',
    suggestions: [
      { icon: 'home', text: 'Stay indoors — hazardous air quality.' },
      { icon: 'medication', text: 'Take your medication immediately and monitor symptoms.' },
    ],
    cta: { label: 'Log Medication Now', href: '/log', variant: 'critical' as const },
  },
}

export default function AetherSuggestionCard({ status }: AetherSuggestionCardProps) {
  const cfg = CONFIG[status]

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn('rounded-xl p-6 shadow-card h-full flex flex-col gap-4', cfg.bg)}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', cfg.iconBg)}>
          <Icon name="smart_toy" filled size={22} className={cfg.iconColor} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
            Suggestions
          </p>
          <p className="font-semibold text-on-surface text-sm">{cfg.title}</p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex flex-col gap-3 flex-1">
        {cfg.suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/50 rounded-xl p-3">
            <Icon name={s.icon} filled size={18} className={cn('mt-0.5 shrink-0', cfg.iconColor)} />
            <p className="text-sm text-on-surface leading-snug">{s.text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={cfg.cta.href}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm active:scale-95 transition-all',
          cfg.cta.variant === 'secondary' && 'bg-secondary text-white hover:bg-secondary/90',
          cfg.cta.variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
          cfg.cta.variant === 'critical' && 'bg-error text-white hover:bg-error/90',
        )}
      >
        {cfg.cta.label}
      </Link>
    </motion.div>
  )
}
