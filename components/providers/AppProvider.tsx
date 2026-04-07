'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type {
  AppUser,
  EnvironmentData,
  Habit,
  HabitEntry,
  Notification,
  CardState,
  UserProfile,
} from '@/lib/types'
import {
  MOCK_USER,
  MOCK_ENV_SAFE,
  MOCK_ENV_WARNING,
  MOCK_NOTIFICATIONS,
  MOCK_HABITS,
  MOCK_HABIT_ENTRIES,
} from '@/lib/mockData'
import { evaluateAtmosphericStatus, evaluateTreatmentStatus, aggregateStatus } from '@/lib/statusEvaluator'

interface AppContextValue {
  user: AppUser
  env: EnvironmentData
  habits: Habit[]
  habitEntries: HabitEntry[]
  notifications: Notification[]
  cardStates: CardState[]
  heroStatus: ReturnType<typeof aggregateStatus>
  isLoading: boolean
  isMockMode: boolean
  envMode: 'safe' | 'warning'
  // habits
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>
  updateHabit: (habit: Habit) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  // entries
  upsertHabitEntry: (entry: HabitEntry) => Promise<void>
  // notifications
  markNotificationRead: (id: string) => void
  // dev
  toggleEnv: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

function isGuestMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('healthguard_guest=true')
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading]       = useState(true)
  const [isMockMode, setIsMockMode]     = useState(false)
  const [envMode, setEnvMode]           = useState<'safe' | 'warning'>('safe')
  const [userProfile, setUserProfile]   = useState<UserProfile>(MOCK_USER)
  const [habits, setHabits]             = useState<Habit[]>([])
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const env = envMode === 'safe' ? MOCK_ENV_SAFE : MOCK_ENV_WARNING

  const cardStates: CardState[] = [
    evaluateAtmosphericStatus(env),
    evaluateTreatmentStatus(habits, habitEntries),
  ]
  const heroStatus = aggregateStatus(cardStates)

  useEffect(() => {
    const mockMode = isGuestMode()
    setIsMockMode(mockMode)

    if (mockMode) {
      setUserProfile(MOCK_USER)
      setHabits(MOCK_HABITS)
      setHabitEntries(MOCK_HABIT_ENTRIES)
      setNotifications(MOCK_NOTIFICATIONS)
      setIsLoading(false)
      return
    }

    async function loadRealData() {
      try {
        const [profileRes, habitsRes, entriesRes, notifsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/habits'),
          fetch('/api/habit-entries'),
          fetch('/api/notifications'),
        ])

        if (profileRes.ok) {
          setUserProfile(await profileRes.json())
        } else {
          const err = await profileRes.json().catch(() => ({}))
          console.error('[AppProvider] /api/profile error', profileRes.status, err)
        }
        if (habitsRes.ok) {
          setHabits(await habitsRes.json())
        } else {
          const err = await habitsRes.json().catch(() => ({}))
          console.error('[AppProvider] /api/habits error', habitsRes.status, err)
        }
        if (entriesRes.ok) {
          setHabitEntries(await entriesRes.json())
        } else {
          const err = await entriesRes.json().catch(() => ({}))
          console.error('[AppProvider] /api/habit-entries error', entriesRes.status, err)
        }
        if (notifsRes.ok) {
          setNotifications(await notifsRes.json())
        } else {
          const err = await notifsRes.json().catch(() => ({}))
          console.error('[AppProvider] /api/notifications error', notifsRes.status, err)
        }
      } catch (err) {
        console.error('[AppProvider] Failed to load app data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRealData()
  }, [])

  // ── Habits ───────────────────────────────────────────────────────────────────

  const addHabit = useCallback(async (habit: Omit<Habit, 'id'>) => {
    if (isMockMode) {
      setHabits((prev) => [...prev, { ...habit, id: `habit-${Date.now()}` }])
      return
    }
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit), // no id — server generates UUID
      })
      if (res.ok) {
        const saved: Habit = await res.json()
        setHabits((prev) => [...prev, saved])
      } else {
        const err = await res.json()
        console.error('addHabit failed:', err)
      }
    } catch (err) {
      console.error('addHabit error:', err)
    }
  }, [isMockMode])

  const updateHabit = useCallback(async (habit: Habit) => {
    // Optimistic
    setHabits((prev) => prev.map((h) => (h.id === habit.id ? habit : h)))
    if (isMockMode) return
    try {
      const res = await fetch('/api/habits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit),
      })
      if (res.ok) {
        const saved: Habit = await res.json()
        setHabits((prev) => prev.map((h) => (h.id === saved.id ? saved : h)))
      } else {
        const err = await res.json()
        console.error('updateHabit failed:', err)
      }
    } catch (err) {
      console.error('updateHabit error:', err)
    }
  }, [isMockMode])

  const deleteHabit = useCallback(async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setHabitEntries((prev) => prev.filter((e) => e.habitId !== id))
    if (isMockMode) return
    try {
      await fetch(`/api/habits?id=${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('deleteHabit error:', err)
    }
  }, [isMockMode])

  // ── Habit entries ────────────────────────────────────────────────────────────

  const upsertHabitEntry = useCallback(async (entry: HabitEntry) => {
    // Optimistic
    setHabitEntries((prev) => {
      const idx = prev.findIndex((e) => e.habitId === entry.habitId && e.date === entry.date)
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next }
      return [...prev, entry]
    })
    if (isMockMode) return
    try {
      const res = await fetch('/api/habit-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (res.ok) {
        const saved: HabitEntry = await res.json()
        setHabitEntries((prev) => {
          const idx = prev.findIndex((e) => e.habitId === saved.habitId && e.date === saved.date)
          if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
          return [...prev, saved]
        })
      } else {
        const err = await res.json()
        console.error('upsertHabitEntry failed:', err)
      }
    } catch (err) {
      console.error('upsertHabitEntry error:', err)
    }
  }, [isMockMode])

  // ── Notifications ────────────────────────────────────────────────────────────

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    if (isMockMode) return
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }, [isMockMode])

  const toggleEnv = useCallback(() => {
    setEnvMode((prev) => (prev === 'safe' ? 'warning' : 'safe'))
  }, [])

  return (
    <AppContext.Provider
      value={{
        user: { profile: userProfile, isMock: isMockMode },
        env,
        habits,
        habitEntries,
        notifications,
        cardStates,
        heroStatus,
        isLoading,
        isMockMode,
        envMode,
        addHabit,
        updateHabit,
        deleteHabit,
        upsertHabitEntry,
        markNotificationRead,
        toggleEnv,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
