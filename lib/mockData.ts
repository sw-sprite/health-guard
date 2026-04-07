import { format, subDays } from 'date-fns'
import type {
  EnvironmentData,
  Habit,
  HabitEntry,
  Notification,
  UserProfile,
} from './types'

const today     = format(new Date(), 'yyyy-MM-dd')
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd')

// ── User ──────────────────────────────────────────────────────────────────────

export const MOCK_USER: UserProfile = {
  id: 'mock-user-1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatarUrl: undefined,
  city: 'Austin, TX',
}

// ── Environment ───────────────────────────────────────────────────────────────

export const MOCK_ENV_SAFE: EnvironmentData = {
  aqi: 42,
  pollenLevel: 'low',
  pollenTypes: { grass: 12, tree: 8, weed: 5, ragweed: 3 },
  temperature: 72,
  humidity: 45,
  city: 'Austin, TX',
  condition: 'Partly Cloudy',
  conditionIcon: 'partly_cloudy_day',
}

export const MOCK_ENV_WARNING: EnvironmentData = {
  aqi: 98,
  pollenLevel: 'high',
  pollenTypes: { grass: 68, tree: 72, weed: 45, ragweed: 52 },
  temperature: 78,
  humidity: 62,
  city: 'Austin, TX',
  condition: 'Sunny',
  conditionIcon: 'sunny',
}

// ── Notifications ─────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'High Pollen Alert',
    message: 'Tree pollen is very high today. Consider taking your allergy medication.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'notif-2',
    title: 'Medication Reminder',
    message: 'Your next Cetirizine dose is due today.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'notif-3',
    title: 'Safe Window',
    message: 'Air quality is excellent today. Great time for outdoor activities!',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
]

// ── Habits ────────────────────────────────────────────────────────────────────

export const MOCK_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Cetirizine 10mg',
    icon: 'medication',
    category: 'medication',
    goalAmount: 1,
    goalUnit: 'times',
    goalPer: 'day',
    repeat: { type: 'daily', days: [] },
    timeOfDay: ['morning'],
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endCondition: 'never',
    reminderTime: '08:00 AM',
    medicationDosage: '10mg',
    medicationFrequencyHours: 24,
  },
  {
    id: 'habit-2',
    name: 'Drink Water',
    icon: 'water_drop',
    category: 'health',
    goalAmount: 2000,
    goalUnit: 'ml',
    goalPer: 'day',
    repeat: { type: 'daily', days: [] },
    timeOfDay: ['morning', 'afternoon', 'evening'],
    startDate: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
    endCondition: 'never',
    reminderTime: '08:00 AM',
  },
  {
    id: 'habit-3',
    name: 'Meditate',
    icon: 'self_improvement',
    category: 'lifestyle',
    goalAmount: 10,
    goalUnit: 'minutes',
    goalPer: 'day',
    repeat: { type: 'daily', days: [1, 2, 3, 4, 5] }, // Mon–Fri
    timeOfDay: ['morning'],
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endCondition: 'never',
    reminderTime: '07:00 AM',
  },
]

// ── Habit Entries ─────────────────────────────────────────────────────────────

export const MOCK_HABIT_ENTRIES: HabitEntry[] = [
  // Today
  { habitId: 'habit-1', date: today,      status: 'pending',  amount: 0 },
  { habitId: 'habit-2', date: today,      status: 'pending',  amount: 600 },
  { habitId: 'habit-3', date: today,      status: 'success',  amount: 10 },
  // Yesterday
  { habitId: 'habit-1', date: yesterday,  status: 'success',  amount: 1 },
  { habitId: 'habit-2', date: yesterday,  status: 'success',  amount: 2000 },
  { habitId: 'habit-3', date: yesterday,  status: 'skipped',  amount: 0 },
  // Two days ago
  { habitId: 'habit-1', date: twoDaysAgo, status: 'success',  amount: 1 },
  { habitId: 'habit-2', date: twoDaysAgo, status: 'failed',   amount: 800 },
  { habitId: 'habit-3', date: twoDaysAgo, status: 'success',  amount: 10 },
]

// ── Weekly Wellness (mock — Phase 2) ──────────────────────────────────────────

export const MOCK_WEEKLY_WELLNESS = {
  sleep:       { hours: 7.2, change: 8 },
  activeHours: { hours: 1.8, change: -12 },
  hydration:   { glasses: 6, change: 20 },
}
