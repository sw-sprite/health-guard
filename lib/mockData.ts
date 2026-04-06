import type { EnvironmentData, MedicationLog, Notification, UserProfile } from './types'



export const MOCK_USER: UserProfile = {
  id: 'mock-user-1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatarUrl: undefined,
  city: 'Austin, TX',
  medications: [
    {
      id: 'med-1',
      name: 'Cetirizine',
      dosage: '10mg',
      frequencyHours: 24,
    },
  ],
}

// Safe environment — low pollen, clean air
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

// Warning environment — high pollen
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

export const MOCK_MEDICATION_LOGS: MedicationLog[] = [
  {
    id: 'log-1',
    type: 'medication',
    medicationId: 'med-1',
    medicationName: 'Cetirizine 10mg',
    loggedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    notes: 'Taken with breakfast',
  },
  {
    id: 'log-2',
    type: 'medication',
    medicationId: 'med-1',
    medicationName: 'Cetirizine 10mg',
    loggedAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
  },
  {
    id: 'log-3',
    type: 'medication',
    medicationId: 'med-1',
    medicationName: 'Cetirizine 10mg',
    loggedAt: new Date(Date.now() - 52 * 60 * 60 * 1000),
  },
]

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
    message: 'Your next Cetirizine dose is in 20 hours.',
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

export const MOCK_WEEKLY_WELLNESS = {
  sleep: { hours: 7.2, change: 8 },
  activeHours: { hours: 1.8, change: -12 },
  hydration: { glasses: 6, change: 20 },
}
