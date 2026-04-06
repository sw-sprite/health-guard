'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AppUser, EnvironmentData, MedicationLog, Notification, CardState, UserProfile } from '@/lib/types'
import {
  MOCK_USER,
  MOCK_ENV_SAFE,
  MOCK_ENV_WARNING,
  MOCK_MEDICATION_LOGS,
  MOCK_NOTIFICATIONS,
} from '@/lib/mockData'
import { evaluateAtmosphericStatus, evaluateTreatmentStatus, aggregateStatus } from '@/lib/statusEvaluator'

interface AppContextValue {
  user: AppUser
  env: EnvironmentData
  logs: MedicationLog[]
  notifications: Notification[]
  cardStates: CardState[]
  heroStatus: ReturnType<typeof aggregateStatus>
  isLoading: boolean
  isMockMode: boolean
  envMode: 'safe' | 'warning'
  addLog: (log: Omit<MedicationLog, 'id' | 'loggedAt'>) => Promise<void>
  markNotificationRead: (id: string) => void
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
  const [isLoading, setIsLoading] = useState(true)
  const [isMockMode, setIsMockMode] = useState(false)
  const [envMode, setEnvMode] = useState<'safe' | 'warning'>('safe')

  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER)
  const [logs, setLogs] = useState<MedicationLog[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Determine env (always mocked in v1 — no weather API yet)
  const env = envMode === 'safe' ? MOCK_ENV_SAFE : MOCK_ENV_WARNING

  // Compute card states from live data
  const cardStates: CardState[] = [
    evaluateAtmosphericStatus(env),
    evaluateTreatmentStatus(logs, userProfile.medications),
  ]
  const heroStatus = aggregateStatus(cardStates)

  // On mount: detect guest/mock mode and load data
  useEffect(() => {
    const mockMode = isGuestMode()
    setIsMockMode(mockMode)

    if (mockMode) {
      setUserProfile(MOCK_USER)
      setLogs(MOCK_MEDICATION_LOGS)
      setNotifications(MOCK_NOTIFICATIONS)
      setIsLoading(false)
      return
    }

    // Real user — fetch from API
    async function loadRealData() {
      try {
        const [profileRes, logsRes, notifsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/logs'),
          fetch('/api/notifications'),
        ])

        if (profileRes.ok) setUserProfile(await profileRes.json())
        if (logsRes.ok) setLogs(await logsRes.json())
        if (notifsRes.ok) setNotifications(await notifsRes.json())
      } catch (err) {
        console.error('Failed to load app data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRealData()
  }, [])

  const addLog = useCallback(async (log: Omit<MedicationLog, 'id' | 'loggedAt'>) => {
    if (isMockMode) {
      // In-memory — same as before
      const newLog: MedicationLog = {
        ...log,
        id: `log-${Date.now()}`,
        loggedAt: new Date(),
      }
      setLogs((prev) => [newLog, ...prev])
      if (log.type === 'medication') {
        const notif: Notification = {
          id: `notif-${Date.now()}`,
          title: 'Dose Logged',
          message: `${log.medicationName} logged successfully.`,
          type: 'info',
          read: false,
          createdAt: new Date(),
        }
        setNotifications((prev) => [notif, ...prev])
      }
      return
    }

    // Real mode — persist to Supabase via API
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      })
      if (res.ok) {
        const saved: MedicationLog = await res.json()
        setLogs((prev) => [saved, ...prev])
        // Optimistic notification for medication entries
        if (log.type === 'medication') {
          const notif: Notification = {
            id: `notif-optimistic-${Date.now()}`,
            title: 'Dose Logged',
            message: `${log.medicationName} logged successfully.`,
            type: 'info',
            read: false,
            createdAt: new Date(),
          }
          setNotifications((prev) => [notif, ...prev])
        }
      }
    } catch (err) {
      console.error('Failed to save log:', err)
    }
  }, [isMockMode])

  const markNotificationRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

    if (!isMockMode) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {}) // fire and forget
    }
  }, [isMockMode])

  const toggleEnv = useCallback(() => {
    setEnvMode((prev) => (prev === 'safe' ? 'warning' : 'safe'))
  }, [])

  return (
    <AppContext.Provider
      value={{
        user: { profile: userProfile, isMock: isMockMode },
        env,
        logs,
        notifications,
        cardStates,
        heroStatus,
        isLoading,
        isMockMode,
        envMode,
        addLog,
        markNotificationRead,
        toggleEnv,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
