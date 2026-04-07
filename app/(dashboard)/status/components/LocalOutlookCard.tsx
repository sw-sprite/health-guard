'use client'

import Icon from '@/components/ui/Icon'
import type { EnvironmentData } from '@/lib/types'

interface LocalOutlookCardProps {
  env: EnvironmentData
}

export default function LocalOutlookCard({ env }: LocalOutlookCardProps) {
  return (
    <div className="rounded-lg p-6 shadow-card bg-gradient-to-br from-secondary to-secondary-container/80 h-full flex flex-col justify-between min-h-[180px]">
      {/* Location */}
      <div className="flex items-center gap-1.5 text-white/80">
        <Icon name="location_on" filled size={16} />
        <span className="text-xs font-semibold tracking-wide">{env.city}</span>
      </div>

      {/* Big weather icon */}
      <div className="flex justify-center my-2">
        <Icon name={env.conditionIcon} filled size={64} className="text-white opacity-90" />
      </div>

      {/* Temp + condition */}
      <div>
        <p className="text-4xl font-extrabold text-white">{env.temperature}°F</p>
        <p className="text-white/70 text-sm mt-0.5">{env.condition}</p>
        <p className="text-white/50 text-xs mt-1">{env.humidity}% humidity</p>
      </div>
    </div>
  )
}
