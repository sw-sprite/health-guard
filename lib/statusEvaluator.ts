import { format } from 'date-fns'
import type { CardState, EnvironmentData, Habit, HabitEntry } from './types'

function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function evaluateAtmosphericStatus(env: EnvironmentData): CardState {
  const { aqi, pollenLevel, pollenTypes } = env

  if (aqi > 300 || pollenLevel === 'extreme' || pollenTypes.ragweed > 80) {
    return {
      id: 'atmospheric-intelligence',
      status: 'critical',
      message: 'Hazardous air quality detected. Stay indoors and keep windows closed.',
      priority: 2,
      timestamp: new Date(),
      actionable: true,
      action: { label: 'Log Medication', href: '/log' },
    }
  }

  if (aqi > 150 || pollenLevel === 'high') {
    return {
      id: 'atmospheric-intelligence',
      status: 'warning',
      message: 'High pollen detected. Consider taking your allergy medication.',
      priority: 1,
      timestamp: new Date(),
      actionable: true,
      action: { label: 'Log Medication', href: '/log' },
    }
  }

  return {
    id: 'atmospheric-intelligence',
    status: 'safe',
    message: 'Air quality is excellent. Perfect for outdoor activities.',
    priority: 0,
    timestamp: new Date(),
    actionable: false,
  }
}

export function evaluateTreatmentStatus(
  habits: Habit[],
  entries: HabitEntry[]
): CardState {
  const medications = habits.filter((h) => h.category === 'medication')

  if (medications.length === 0) {
    return {
      id: 'treatment-window',
      status: 'safe',
      message: 'No medications configured. Add one in the Log tab.',
      priority: 0,
      timestamp: new Date(),
      actionable: false,
    }
  }

  const primaryMed = medications[0]
  const todayEntry = entries.find(
    (e) => e.habitId === primaryMed.id && e.date === today()
  )

  if (!todayEntry || todayEntry.status === 'pending') {
    const freqHours = primaryMed.medicationFrequencyHours ?? 24
    return {
      id: 'treatment-window',
      status: 'warning',
      message: `${primaryMed.name} not logged today. Dose due every ${freqHours}h.`,
      priority: 1,
      timestamp: new Date(),
      actionable: true,
      action: { label: 'Log Dose', href: '/log' },
    }
  }

  if (todayEntry.status === 'success') {
    return {
      id: 'treatment-window',
      status: 'safe',
      message: `${primaryMed.name} logged today. You're on track.`,
      priority: 0,
      timestamp: new Date(),
      actionable: false,
    }
  }

  if (todayEntry.status === 'failed') {
    return {
      id: 'treatment-window',
      status: 'critical',
      message: `${primaryMed.name} marked as missed today.`,
      priority: 2,
      timestamp: new Date(),
      actionable: true,
      action: { label: 'Update Log', href: '/log' },
    }
  }

  return {
    id: 'treatment-window',
    status: 'safe',
    message: `${primaryMed.name} logged for today.`,
    priority: 0,
    timestamp: new Date(),
    actionable: false,
  }
}

export function aggregateStatus(cardStates: CardState[]): {
  status: 'safe' | 'warning' | 'critical'
  message: string
  primaryCard: CardState
} {
  const sorted = [...cardStates].sort((a, b) => b.priority - a.priority)
  const primary = sorted[0]

  if (primary.priority === 2) {
    return { status: 'critical', message: primary.message, primaryCard: primary }
  }
  if (primary.priority === 1) {
    return { status: 'warning', message: primary.message, primaryCard: primary }
  }
  return {
    status: 'safe',
    message: "You're covered. All vitals and environmental factors are within your optimal range.",
    primaryCard: primary,
  }
}
