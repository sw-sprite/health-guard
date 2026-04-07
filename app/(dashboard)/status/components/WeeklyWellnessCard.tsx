'use client'

import Icon from '@/components/ui/Icon'
import { MOCK_WEEKLY_WELLNESS } from '@/lib/mockData'
import { cn } from '@/lib/utils'

interface WellnessMetric {
  label: string
  value: string
  unit: string
  change: number
  icon: string
}

export default function WeeklyWellnessCard() {
  const { sleep, activeHours, hydration } = MOCK_WEEKLY_WELLNESS

  const metrics: WellnessMetric[] = [
    { label: 'Sleep', value: sleep.hours.toString(), unit: 'hrs/night', change: sleep.change, icon: 'bedtime' },
    { label: 'Active', value: activeHours.hours.toString(), unit: 'hrs/day', change: activeHours.change, icon: 'directions_run' },
    { label: 'Hydration', value: hydration.glasses.toString(), unit: 'glasses/day', change: hydration.change, icon: 'water_drop' },
  ]

  return (
    <div className="rounded-lg p-6 shadow-card bg-surface-container-low h-full flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
          Weekly Wellness
        </p>
        <h3 className="font-bold text-on-surface">7-Day Overview</h3>
      </div>

      <div className="flex flex-col gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3 bg-white/60 rounded p-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-secondary/10">
              <Icon name={m.icon} filled size={20} className="text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-on-surface-variant">{m.label}</p>
              <p className="font-bold text-on-surface text-sm">
                {m.value}
                <span className="font-normal text-on-surface-variant"> {m.unit}</span>
              </p>
            </div>
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs font-semibold',
                m.change >= 0 ? 'text-secondary' : 'text-primary'
              )}
            >
              <Icon
                name={m.change >= 0 ? 'trending_up' : 'trending_down'}
                size={14}
              />
              {Math.abs(m.change)}%
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-on-surface-variant/60 text-center">
        Mock data — real metrics coming in Phase 2
      </p>
    </div>
  )
}
