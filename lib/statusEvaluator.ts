import { differenceInHours } from 'date-fns'
import type { CardState, EnvironmentData, MedicationLog, Medication } from './types'

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
  logs: MedicationLog[],
  medications: Medication[]
): CardState {
  if (!medications.length) {
    return {
      id: 'treatment-window',
      status: 'safe',
      message: 'No medications configured.',
      priority: 0,
      timestamp: new Date(),
      actionable: false,
    }
  }

  const primaryMed = medications[0]
  const recentLog = logs
    .filter((l) => l.medicationId === primaryMed.id)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())[0]

  if (!recentLog) {
    return {
      id: 'treatment-window',
      status: 'warning',
      message: `No ${primaryMed.name} logged yet. Log your first dose.`,
      priority: 1,
      timestamp: new Date(),
      actionable: true,
      action: { label: 'Log Dose', href: '/log' },
    }
  }

  const hoursSince = differenceInHours(new Date(), new Date(recentLog.loggedAt))
  const interval = primaryMed.frequencyHours

  if (hoursSince > interval + 2) {
    return {
      id: 'treatment-window',
      status: 'critical',
      message: `${primaryMed.name} dose overdue by ${hoursSince - interval} hours.`,
      priority: 2,
      timestamp: new Date(),
      actionable: true,
      action: { label: 'Confirm Dosage', href: '/log' },
    }
  }

  if (hoursSince > interval - 4) {
    const hoursLeft = interval - hoursSince
    return {
      id: 'treatment-window',
      status: 'warning',
      message: `${primaryMed.name} due in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.`,
      priority: 1,
      timestamp: new Date(),
      actionable: false,
    }
  }

  const hoursLeft = interval - hoursSince
  return {
    id: 'treatment-window',
    status: 'safe',
    message: `Next ${primaryMed.name} dose in ${hoursLeft} hours.`,
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
