// ── Status / Environment ───────────────────────────────────────────────────────

export type CardStatus = 'safe' | 'warning' | 'critical'

export interface CardState {
  id: string
  status: CardStatus
  message: string
  priority: number // 0=safe 1=warning 2=critical
  timestamp: Date
  actionable: boolean
  action?: { label: string; href: string }
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

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  city: string
}

export interface AppUser {
  profile: UserProfile
  isMock: boolean
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'critical'
  read: boolean
  createdAt: Date
}

// ── Habits ────────────────────────────────────────────────────────────────────

export type HabitCategory   = 'medication' | 'health' | 'lifestyle'
export type HabitStatus     = 'pending' | 'success' | 'skipped' | 'failed'
export type GoalPer         = 'day' | 'week' | 'month' | 'year'
export type EndCondition    = 'never' | 'on_date'

export interface HabitRepeatDaily {
  type: 'daily'
  days: number[] // 0=Sun … 6=Sat; empty = every day
}
export interface HabitRepeatMonthly {
  type: 'monthly'
  days: number[] // 1 … 31
}
export interface HabitRepeatInterval {
  type: 'interval'
  everyDays: number
}
export type HabitRepeat =
  | HabitRepeatDaily
  | HabitRepeatMonthly
  | HabitRepeatInterval

export interface Habit {
  id: string
  name: string
  icon: string
  category: HabitCategory
  goalAmount: number
  goalUnit: string          // free text: "times", "ml", "minutes", etc.
  goalPer: GoalPer
  repeat: HabitRepeat
  timeOfDay: ('morning' | 'afternoon' | 'evening')[]
  startDate: string         // YYYY-MM-DD
  endCondition: EndCondition
  endDate?: string          // YYYY-MM-DD — only when endCondition = 'on_date'
  reminderTime: string      // display-only e.g. "08:00 AM"
  // medication-specific (undefined for non-medication habits)
  medicationDosage?: string
  medicationFrequencyHours?: number
}

export interface HabitEntry {
  habitId: string
  date: string   // YYYY-MM-DD
  status: HabitStatus
  amount: number
}
