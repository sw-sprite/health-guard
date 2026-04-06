export type CardStatus = 'safe' | 'warning' | 'critical'

export interface CardState {
  id: string
  status: CardStatus
  message: string
  priority: number // 0=safe 1=warning 2=critical
  timestamp: Date
  actionable: boolean
  action?: {
    label: string
    href: string
  }
}

export interface PollenTypes {
  grass: number
  tree: number
  weed: number
  ragweed: number
}

export interface EnvironmentData {
  aqi: number
  pollenLevel: 'low' | 'medium' | 'high' | 'extreme'
  pollenTypes: PollenTypes
  temperature: number
  humidity: number
  city: string
  condition: string
  conditionIcon: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequencyHours: number
}

export type LogType = 'medication' | 'hydration' | 'exercise' | 'note'

export interface MedicationLog {
  id: string
  type: LogType
  medicationId?: string   // only set for medication entries
  medicationName: string  // display label for all types
  loggedAt: Date
  notes?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'critical'
  read: boolean
  createdAt: Date
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  city: string
  medications: Medication[]
}

export interface AppUser {
  profile: UserProfile
  isMock: boolean
}
