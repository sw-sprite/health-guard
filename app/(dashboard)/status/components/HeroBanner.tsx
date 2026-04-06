'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'
import type { CardStatus } from '@/lib/types'

interface HeroBannerProps {
  status: CardStatus | 'safe'
  message: string
  userName: string
}

const CONFIG = {
  safe: {
    gradient: 'from-secondary/80 via-secondary/30 to-transparent',
    bgGradient: 'from-secondary to-secondary-container/60',
    badge: 'All Clear',
    badgeVariant: 'safe' as const,
    headline: 'You\'re Protected',
    cta: { label: 'Plan a Walk', href: '/log', icon: 'directions_walk' },
    secondaryCta: { label: 'View Log', href: '/log' },
    icon: 'shield_with_heart',
    patternColor: 'rgba(59,100,118,0.15)',
  },
  warning: {
    gradient: 'from-primary/90 via-primary/50 to-transparent',
    bgGradient: 'from-primary to-primary-container/70',
    badge: 'Action Needed',
    badgeVariant: 'warning' as const,
    headline: 'High Pollen Alert',
    cta: { label: 'Log Medication Dose', href: '/log', icon: 'medication' },
    secondaryCta: { label: 'Dismiss', href: '#' },
    icon: 'warning',
    patternColor: 'rgba(172,48,68,0.2)',
  },
  critical: {
    gradient: 'from-error/90 via-error/50 to-transparent',
    bgGradient: 'from-error to-error-container/70',
    badge: 'Critical Alert',
    badgeVariant: 'critical' as const,
    headline: 'Hazardous Conditions',
    cta: { label: 'Log Medication Now', href: '/log', icon: 'emergency' },
    secondaryCta: { label: 'Dismiss', href: '#' },
    icon: 'emergency',
    patternColor: 'rgba(186,26,26,0.2)',
  },
}

export default function HeroBanner({ status, message, userName }: HeroBannerProps) {
  const cfg = CONFIG[status]
  const firstName = userName.split(' ')[0]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className={`relative overflow-hidden rounded-xl md:rounded-[2rem] bg-gradient-to-br ${cfg.bgGradient} min-h-[320px] md:min-h-[380px] flex flex-col justify-end p-8 md:p-12`}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30"
          style={{ background: `radial-gradient(circle, ${cfg.patternColor} 0%, transparent 70%)` }}
        />
        <div
          className="absolute top-1/2 -right-12 w-64 h-64 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${cfg.patternColor} 0%, transparent 70%)` }}
        />

        {/* Icon watermark */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12 opacity-20">
          <Icon name={cfg.icon} filled size={120} className="text-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <Badge variant="ghost" className="mb-4">
            <Icon name={cfg.icon} filled size={12} />
            {cfg.badge}
          </Badge>

          <p className="text-white/70 text-sm font-medium mb-1">
            Good {getTimeOfDay()}, {firstName}
          </p>

          <motion.h1
            key={`headline-${status}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            {cfg.headline}
          </motion.h1>

          <motion.p
            key={`msg-${status}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-md"
          >
            {message}
          </motion.p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={cfg.cta.href}
              className="flex items-center gap-2 px-6 py-3 bg-white text-on-surface rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Icon name={cfg.cta.icon} filled size={18} />
              {cfg.cta.label}
            </Link>
            <Link
              href={cfg.secondaryCta.href}
              className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-semibold text-sm hover:bg-white/30 transition-all active:scale-95"
            >
              {cfg.secondaryCta.label}
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
