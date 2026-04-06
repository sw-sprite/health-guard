# Health Guard - Architecture Design Document

## Executive Summary

**Health Guard** is a production-ready web POC that combines environmental intelligence, predictive health algorithms, and Apple-style UI polish to create a proactive health monitoring system. This document defines the technical architecture for the initial Status Screen + Medication Log implementation.

**Core Innovation**: Card-level status evaluation system where each UI card independently assesses health metrics, with intelligent aggregation in the hero banner to provide contextual, actionable guidance.

---

## 1. Design System & UI Architecture

### 1.1 Design Tokens (Single Source of Truth)

Extracted from `/health_guard/designs/screens/*/code.html`:

```typescript
// Color Palette (Material Design 3)
export const colors = {
  // Primary (Health Alert / CTA)
  primary: '#ac3044',
  'primary-container': '#ff6e7f',
  'on-primary': '#ffffff',
  'primary-fixed': '#ffdadb',
  'primary-fixed-dim': '#ffb2b7',

  // Secondary (Environmental / Info)
  secondary: '#3b6476',
  'secondary-container': '#bfe9ff',
  'on-secondary': '#ffffff',
  'secondary-fixed': '#bfe9ff',

  // Tertiary (Neutral / Metadata)
  tertiary: '#595f68',
  'tertiary-container': '#989ea8',
  'on-tertiary': '#ffffff',

  // Surfaces
  background: '#f8f9ff',
  surface: '#f8f9ff',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#eef4ff',
  'surface-container': '#e9eef9',
  'surface-container-high': '#e3e8f3',
  'surface-container-highest': '#dde3ed',

  // Semantic
  error: '#ba1a1a',
  'error-container': '#ffdad6',
  'on-error': '#ffffff',

  // Text
  'on-surface': '#161c23',
  'on-surface-variant': '#584142',
  'on-background': '#161c23',

  // Borders
  outline: '#8b7172',
  'outline-variant': '#dfbfc0',
}

// Typography
export const typography = {
  fontFamily: {
    headline: ['Inter', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
    label: ['Inter', 'sans-serif'],
  },

  // Border Radius
  borderRadius: {
    DEFAULT: '1rem',    // 16px - cards
    lg: '2rem',         // 32px - hero sections
    xl: '3rem',         // 48px - major containers
    full: '9999px',     // buttons, pills
  },
}

// Glass Morphism
export const glassCard = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}

// Shadow System
export const shadows = {
  navbar: '0 8px 30px rgb(0,0,0,0.04)',
  card: '0 20px 40px rgba(22,28,35,0.03)',
  button: 'shadow-lg hover:shadow-xl',
}
```

### 1.2 Component Hierarchy

```
app/
├── (auth)/
│   ├── login/
│   └── callback/
├── (dashboard)/
│   ├── status/              ← PRIMARY FOCUS (Phase 1)
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── HeroBanner.tsx
│   │       ├── AtmosphericIntelligenceCard.tsx
│   │       ├── TreatmentWindowCard.tsx
│   │       ├── LocalOutlookCard.tsx
│   │       ├── AetherSuggestionCard.tsx
│   │       └── WeeklyWellnessCard.tsx
│   ├── trends/              ← Phase 2
│   ├── log/                 ← Phase 1 (Basic)
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── QuickLogCard.tsx
│   │       └── RecentActivityList.tsx
│   └── settings/            ← Phase 3
├── components/
│   ├── ui/                  ← Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Icon.tsx
│   ├── shared/
│   │   ├── TopNavBar.tsx
│   │   ├── NotificationDropdown.tsx
│   │   └── UserAvatar.tsx
│   └── providers/
│       ├── AuthProvider.tsx
│       └── StatusProvider.tsx
└── api/
    ├── environment/
    │   └── route.ts         ← Weather/Pollen aggregation
    ├── predict/
    │   └── route.ts         ← Predictive algorithm
    ├── intake/
    │   └── route.ts         ← Medication logging
    └── notifications/
        └── route.ts         ← In-app notifications
```

### 1.3 Framer Motion Animation Strategy

```typescript
// Card Status Transitions
export const cardVariants = {
  safe: {
    backgroundColor: 'rgba(221, 227, 237, 1)', // surface-container-high
    borderColor: 'transparent',
    scale: 1,
    transition: { duration: 0.6, ease: 'easeInOut' }
  },
  warning: {
    backgroundColor: 'rgba(255, 110, 127, 0.1)', // primary-container/10
    borderColor: 'rgba(172, 48, 68, 0.2)', // primary/20
    scale: 1.02,
    transition: { duration: 0.6, ease: 'easeInOut' }
  },
  critical: {
    backgroundColor: 'rgba(186, 26, 26, 0.05)', // error/5
    borderColor: 'rgba(186, 26, 26, 0.4)', // error/40
    scale: 1.02,
    boxShadow: '0 0 30px rgba(186, 26, 26, 0.3)',
    transition: { duration: 0.6, ease: 'easeInOut' }
  }
}

// Hero Banner Morphing
export const heroBannerVariants = {
  safe: {
    backgroundImage: 'url(/images/hero-safe.jpg)', // Teal mountains
    transition: { duration: 1.2, ease: 'easeInOut' }
  },
  warning: {
    backgroundImage: 'url(/images/hero-warning.jpg)', // Orange pollen
    transition: { duration: 1.2, ease: 'easeInOut' }
  }
}

// Attention-grabbing pulse for warning cards
export const pulseAnimation = {
  scale: [1, 1.02, 1],
  opacity: [1, 0.95, 1],
  transition: {
    repeat: Infinity,
    duration: 2,
    ease: 'easeInOut'
  }
}
```

---

## 2. Card-Level Status Architecture

### 2.1 Status Evaluation System

Each card is an **autonomous evaluation unit** that computes its own status based on domain-specific logic.

```typescript
// Core Types
export type CardStatus = 'safe' | 'warning' | 'critical'

export interface CardState {
  id: string
  status: CardStatus
  message: string
  priority: number // 0 = safe, 1 = warning, 2 = critical
  timestamp: Date
  actionable: boolean
  action?: {
    label: string
    handler: () => void
  }
}

export interface StatusContext {
  // Environmental Data
  aqi: number
  pollenLevel: 'low' | 'medium' | 'high' | 'extreme'
  pollenTypes: {
    grass: number
    tree: number
    weed: number
    ragweed: number
  }
  temperature: number
  humidity: number

  // User Health Data
  lastMedicationTime: Date | null
  medications: Array<{
    name: string
    dosage: string
    frequency: string // e.g., "24h"
  }>

  // Notifications
  notifications: Array<Notification>
}
```

### 2.2 Card Evaluation Logic

Each card exports an `evaluateStatus` function:

```typescript
// AtmosphericIntelligenceCard.tsx
export function evaluateStatus(context: StatusContext): CardState {
  const { aqi, pollenLevel, pollenTypes } = context

  // Critical: Hazardous AQI or Extreme Pollen
  if (aqi > 300 || pollenLevel === 'extreme' || pollenTypes.ragweed > 80) {
    return {
      id: 'atmospheric-intelligence',
      status: 'critical',
      message: 'Hazardous air quality detected. Stay indoors.',
      priority: 2,
      timestamp: new Date(),
      actionable: true,
      action: {
        label: 'View Air Quality Map',
        handler: () => window.open('/air-quality-map')
      }
    }
  }

  // Warning: High AQI or High Pollen
  if (aqi > 150 || pollenLevel === 'high') {
    return {
      id: 'atmospheric-intelligence',
      status: 'warning',
      message: 'High pollen detected. Consider taking allergy medication.',
      priority: 1,
      timestamp: new Date(),
      actionable: true,
      action: {
        label: 'Log Medication',
        handler: () => router.push('/log')
      }
    }
  }

  // Safe
  return {
    id: 'atmospheric-intelligence',
    status: 'safe',
    message: 'Air quality is excellent. Perfect for outdoor activities.',
    priority: 0,
    timestamp: new Date(),
    actionable: false
  }
}

// TreatmentWindowCard.tsx
export function evaluateStatus(context: StatusContext): CardState {
  const { lastMedicationTime, medications } = context

  if (!lastMedicationTime) {
    return {
      id: 'treatment-window',
      status: 'warning',
      message: 'No medication logged today.',
      priority: 1,
      timestamp: new Date(),
      actionable: true,
      action: {
        label: 'Log Now',
        handler: () => router.push('/log')
      }
    }
  }

  const hoursSinceLastDose = differenceInHours(new Date(), lastMedicationTime)
  const primaryMed = medications[0]
  const requiredInterval = parseInt(primaryMed.frequency) // "24h" → 24

  // Critical: Dose overdue by >2h
  if (hoursSinceLastDose > requiredInterval + 2) {
    return {
      id: 'treatment-window',
      status: 'critical',
      message: `${primaryMed.name} dose overdue by ${hoursSinceLastDose - requiredInterval} hours.`,
      priority: 2,
      timestamp: new Date(),
      actionable: true,
      action: {
        label: 'Confirm Dosage',
        handler: () => logMedication(primaryMed)
      }
    }
  }

  // Warning: Approaching dose window
  if (hoursSinceLastDose > requiredInterval - 3) {
    return {
      id: 'treatment-window',
      status: 'warning',
      message: `${primaryMed.name} due in ${requiredInterval - hoursSinceLastDose} hours.`,
      priority: 1,
      timestamp: new Date(),
      actionable: false
    }
  }

  // Safe
  return {
    id: 'treatment-window',
    status: 'safe',
    message: `Next dose available in ${requiredInterval - hoursSinceLastDose} hours.`,
    priority: 0,
    timestamp: new Date(),
    actionable: false
  }
}
```

### 2.3 Hero Banner Aggregation

```typescript
// StatusProvider.tsx
export function aggregateCardStatuses(cardStates: CardState[]): {
  status: CardStatus
  message: string
  primaryCard: CardState
} {
  // Find highest priority card
  const sortedCards = [...cardStates].sort((a, b) => b.priority - a.priority)
  const primaryCard = sortedCards[0]

  if (primaryCard.priority === 2) {
    return {
      status: 'critical',
      message: primaryCard.message,
      primaryCard
    }
  }

  if (primaryCard.priority === 1) {
    return {
      status: 'warning',
      message: primaryCard.message,
      primaryCard
    }
  }

  return {
    status: 'safe',
    message: "You're covered until 8:00 PM. All vitals and environmental factors are within your optimal range.",
    primaryCard
  }
}
```

---

## 3. Database Schema (Supabase + PostgreSQL)

### 3.1 Core Tables

```sql
-- Users table (Managed by Supabase Auth)
-- We extend it with custom profiles

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  location_city TEXT, -- e.g., "San Francisco"
  location_lat DECIMAL(9,6),
  location_lng DECIMAL(9,6),
  timezone TEXT DEFAULT 'America/Los_Angeles',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Logs (Phase 1 - Simple Schema)
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL, -- e.g., "Cetirizine", "Vitamin D3"
  dosage TEXT, -- e.g., "10mg", "2000 IU" (optional for Phase 1)
  logged_at TIMESTAMPTZ NOT NULL, -- When they took it
  created_at TIMESTAMPTZ DEFAULT NOW(), -- When they logged it
  notes TEXT, -- Optional freeform notes

  INDEX idx_medication_logs_user_id (user_id),
  INDEX idx_medication_logs_logged_at (logged_at)
);

-- Environmental Data Cache (to reduce API calls)
CREATE TABLE environmental_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_city TEXT NOT NULL,
  aqi INTEGER,
  pollen_level TEXT, -- 'low' | 'medium' | 'high' | 'extreme'
  pollen_grass INTEGER,
  pollen_tree INTEGER,
  pollen_weed INTEGER,
  pollen_ragweed INTEGER,
  temperature DECIMAL(5,2),
  humidity INTEGER,
  weather_condition TEXT, -- e.g., "Mostly Sunny"
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Cache for 30 minutes
  INDEX idx_environmental_data_city_fetched (location_city, fetched_at)
);

-- Notifications (In-App)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'warning' | 'critical' | 'info'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  actionable BOOLEAN DEFAULT FALSE,
  action_url TEXT, -- e.g., "/log" or "/status"
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_notifications_user_id_created (user_id, created_at DESC)
);

-- Mock Users (For POC Testing)
CREATE TABLE mock_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL, -- e.g., "demo_safe", "demo_warning"
  mock_data JSONB NOT NULL, -- Stores mock medication logs, environmental overrides
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Medication Logs: Users can only see/create their own logs
CREATE POLICY "Users can view own medication logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own medication logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3.3 Schema Extension Plan (Future Phases)

```sql
-- Phase 2: Symptom Tracking
ALTER TABLE medication_logs ADD COLUMN symptom_severity INTEGER; -- 1-10 scale
ALTER TABLE medication_logs ADD COLUMN symptom_tags TEXT[]; -- ["sneezing", "itchy_eyes"]

-- Phase 3: Smart Recommendations
CREATE TABLE aether_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recommendation_type TEXT NOT NULL, -- 'exercise' | 'medication' | 'environmental'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Backend Architecture & API Routes

### 4.1 API Endpoint Design

```typescript
// app/api/environment/route.ts
/**
 * GET /api/environment?city=San+Francisco
 *
 * Returns current environmental conditions with 30-minute caching.
 * Integrates with Weather API for pollen/AQI data.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') || 'San Francisco'

  // Check cache first (30 min TTL)
  const cached = await supabase
    .from('environmental_data')
    .select('*')
    .eq('location_city', city)
    .gte('fetched_at', new Date(Date.now() - 30 * 60 * 1000))
    .single()

  if (cached.data) {
    return Response.json(cached.data)
  }

  // Fetch from Weather API
  const weatherData = await fetchWeatherAPI(city)

  // Store in cache
  await supabase.from('environmental_data').insert({
    location_city: city,
    aqi: weatherData.aqi,
    pollen_level: weatherData.pollenLevel,
    pollen_grass: weatherData.pollen.grass,
    pollen_tree: weatherData.pollen.tree,
    pollen_weed: weatherData.pollen.weed,
    pollen_ragweed: weatherData.pollen.ragweed,
    temperature: weatherData.temp,
    humidity: weatherData.humidity,
    weather_condition: weatherData.condition
  })

  return Response.json(weatherData)
}

// app/api/predict/route.ts
/**
 * POST /api/predict
 *
 * Runs predictive algorithm to determine if user should take proactive action.
 * Inputs: User ID, current environmental conditions
 * Output: { shouldAlert: boolean, reason: string, severity: 'info' | 'warning' | 'critical' }
 */
export async function POST(request: Request) {
  const { userId, environmentalData } = await request.json()

  // Fetch user's last medication log
  const lastLog = await supabase
    .from('medication_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single()

  // Run predictive algorithm
  const prediction = runPredictiveAlgorithm({
    lastMedicationTime: lastLog?.logged_at,
    aqi: environmentalData.aqi,
    pollenLevel: environmentalData.pollenLevel
  })

  // Create notification if alert is needed
  if (prediction.shouldAlert) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: prediction.severity,
      title: 'Proactive Health Alert',
      message: prediction.reason,
      actionable: true,
      action_url: '/log'
    })
  }

  return Response.json(prediction)
}

// app/api/intake/route.ts
/**
 * POST /api/intake
 *
 * Logs a medication dose.
 */
export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { medicationName, dosage, loggedAt, notes } = await request.json()

  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      user_id: session.user.id,
      medication_name: medicationName,
      dosage,
      logged_at: loggedAt || new Date().toISOString(),
      notes
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Trigger re-evaluation of card statuses
  // (Client will refetch /api/environment and /api/predict)

  return Response.json({ success: true, log: data })
}

// app/api/notifications/route.ts
/**
 * GET /api/notifications
 *
 * Returns user's in-app notifications (paginated, unread first).
 */
export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('read', { ascending: true }) // Unread first
    .order('created_at', { ascending: false })
    .limit(20)

  return Response.json({ notifications: data })
}

/**
 * PATCH /api/notifications/:id
 *
 * Marks a notification as read.
 */
export async function PATCH(request: Request) {
  const { id } = await request.json()
  const session = await getServerSession()

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', session.user.id)

  return Response.json({ success: true })
}
```

### 4.2 External API Integration (Weather/Pollen)

**Recommended Provider**: WeatherAPI.com (Free tier: 1M calls/month)

```typescript
// lib/weatherAPI.ts
const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1'

export async function fetchWeatherAPI(city: string) {
  const response = await fetch(
    `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=3&aqi=yes`
  )

  const data = await response.json()

  // Transform to our schema
  return {
    aqi: data.current.air_quality['us-epa-index'] || 0,
    pollenLevel: calculatePollenLevel(data),
    pollen: {
      grass: data.forecast.forecastday[0].day.grass_pollen || 0,
      tree: data.forecast.forecastday[0].day.tree_pollen || 0,
      weed: data.forecast.forecastday[0].day.weed_pollen || 0,
      ragweed: data.forecast.forecastday[0].day.ragweed_pollen || 0
    },
    temp: data.current.temp_f,
    humidity: data.current.humidity,
    condition: data.current.condition.text
  }
}

function calculatePollenLevel(data: any): 'low' | 'medium' | 'high' | 'extreme' {
  const maxPollen = Math.max(
    data.forecast.forecastday[0].day.grass_pollen || 0,
    data.forecast.forecastday[0].day.tree_pollen || 0,
    data.forecast.forecastday[0].day.weed_pollen || 0
  )

  if (maxPollen > 9) return 'extreme'
  if (maxPollen > 6) return 'high'
  if (maxPollen > 3) return 'medium'
  return 'low'
}
```

**Fallback**: If WeatherAPI.com doesn't work, use OpenWeatherMap (limited pollen data) + hardcoded mock pollen values for POC.

---

## 5. Predictive Algorithm: "Pre-emptive Strike"

### 5.1 Core Logic (Simple Rule-Based for POC)

```typescript
// lib/predictiveAlgorithm.ts
interface PredictionInput {
  lastMedicationTime: Date | null
  aqi: number
  pollenLevel: 'low' | 'medium' | 'high' | 'extreme'
  pollenForecast?: { // Optional: Tomorrow's forecast
    pollenLevel: 'low' | 'medium' | 'high' | 'extreme'
  }
}

interface PredictionOutput {
  shouldAlert: boolean
  severity: 'info' | 'warning' | 'critical'
  reason: string
  recommendedAction: string
}

export function runPredictiveAlgorithm(input: PredictionInput): PredictionOutput {
  const { lastMedicationTime, aqi, pollenLevel, pollenForecast } = input

  // Rule 1: No medication logged today + high/extreme pollen = CRITICAL
  if (!lastMedicationTime && (pollenLevel === 'high' || pollenLevel === 'extreme')) {
    return {
      shouldAlert: true,
      severity: 'critical',
      reason: 'High pollen detected and no medication logged today.',
      recommendedAction: 'Take allergy medication immediately.'
    }
  }

  // Rule 2: Medication overdue (>24h) + medium+ pollen = CRITICAL
  if (lastMedicationTime) {
    const hoursSinceLastDose = differenceInHours(new Date(), lastMedicationTime)
    if (hoursSinceLastDose > 24 && (pollenLevel === 'medium' || pollenLevel === 'high' || pollenLevel === 'extreme')) {
      return {
        shouldAlert: true,
        severity: 'critical',
        reason: `Medication dose overdue by ${hoursSinceLastDose - 24}h and environmental triggers are elevated.`,
        recommendedAction: 'Log your dose now to maintain protection.'
      }
    }

    // Rule 3: Approaching dose window (20-24h) + forecast shows pollen spike = WARNING
    if (
      hoursSinceLastDose >= 20 &&
      hoursSinceLastDose <= 24 &&
      pollenForecast?.pollenLevel === 'high'
    ) {
      return {
        shouldAlert: true,
        severity: 'warning',
        reason: 'Pollen spike forecasted in 6-8 hours. Consider taking your dose early.',
        recommendedAction: 'Pre-emptive Strike: Take medication now for optimal coverage.'
      }
    }
  }

  // Rule 4: Hazardous AQI (>300) = CRITICAL (regardless of medication)
  if (aqi > 300) {
    return {
      shouldAlert: true,
      severity: 'critical',
      reason: 'Hazardous air quality detected in your area.',
      recommendedAction: 'Stay indoors. Close windows and use air purifier.'
    }
  }

  // Rule 5: Elevated AQI (150-300) = WARNING
  if (aqi > 150) {
    return {
      shouldAlert: true,
      severity: 'warning',
      reason: 'Air quality is unhealthy. Limit outdoor exposure.',
      recommendedAction: 'Wear N95 mask if going outside.'
    }
  }

  // All clear
  return {
    shouldAlert: false,
    severity: 'info',
    reason: 'All environmental and health metrics are within safe range.',
    recommendedAction: 'Continue your current routine.'
  }
}
```

### 5.2 Future Enhancement: Weighted Scoring Model

```typescript
// Phase 2: More sophisticated algorithm
export function runAdvancedPredictiveAlgorithm(input: AdvancedPredictionInput): PredictionOutput {
  const weights = {
    aqi: 0.3,
    pollenLevel: 0.4,
    timeSinceLastDose: 0.2,
    pollenForecast: 0.1
  }

  let riskScore = 0

  // Calculate weighted risk score (0-100)
  riskScore += calculateAQIScore(input.aqi) * weights.aqi
  riskScore += calculatePollenScore(input.pollenLevel) * weights.pollenLevel
  riskScore += calculateDoseTimingScore(input.lastMedicationTime) * weights.timeSinceLastDose
  riskScore += calculateForecastScore(input.pollenForecast) * weights.pollenForecast

  // Map risk score to severity
  if (riskScore > 75) return { severity: 'critical', ... }
  if (riskScore > 50) return { severity: 'warning', ... }
  return { severity: 'info', ... }
}
```

---

## 6. Authentication & Mock User System

### 6.1 Google OAuth Flow (Supabase Auth)

```typescript
// app/api/auth/[...nextauth]/route.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Create user profile if first login
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          full_name: data.user.user_metadata.full_name,
          avatar_url: data.user.user_metadata.avatar_url,
          location_city: 'San Francisco' // Default
        })
      }

      // Redirect to dashboard
      return Response.redirect(new URL('/status', request.url))
    }
  }

  // Redirect to Google OAuth
  const { data: { url } } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    }
  })

  return Response.redirect(url!)
}
```

### 6.2 Mock User System (For POC Testing)

```typescript
// app/api/mock-user/route.ts
/**
 * POST /api/mock-user
 *
 * Creates a mock user session with predefined data.
 * Modes: "safe" | "warning" | "critical"
 */
export async function POST(request: Request) {
  const { mode } = await request.json()

  const mockUserData = {
    safe: {
      username: 'demo_safe',
      mockData: {
        lastMedicationTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
        environmentalOverrides: {
          aqi: 12,
          pollenLevel: 'low'
        }
      }
    },
    warning: {
      username: 'demo_warning',
      mockData: {
        lastMedicationTime: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22h ago
        environmentalOverrides: {
          aqi: 180,
          pollenLevel: 'high'
        }
      }
    },
    critical: {
      username: 'demo_critical',
      mockData: {
        lastMedicationTime: new Date(Date.now() - 26 * 60 * 60 * 1000), // 26h ago (overdue)
        environmentalOverrides: {
          aqi: 842,
          pollenLevel: 'extreme'
        }
      }
    }
  }

  const mockUser = mockUserData[mode]

  // Store in session cookie
  // (Bypass real auth for POC testing)
  return Response.json({ success: true, mockUser })
}

// Middleware to handle mock users
// lib/mockUserMiddleware.ts
export function getMockUserContext(request: Request): StatusContext | null {
  const mockUserCookie = cookies().get('mock_user')
  if (!mockUserCookie) return null

  const mockUser = JSON.parse(mockUserCookie.value)

  return {
    lastMedicationTime: new Date(mockUser.mockData.lastMedicationTime),
    aqi: mockUser.mockData.environmentalOverrides.aqi,
    pollenLevel: mockUser.mockData.environmentalOverrides.pollenLevel,
    // ... other mock data
  }
}
```

---

## 7. In-App Notification System

### 7.1 Notification Dropdown Component

```typescript
// components/shared/NotificationDropdown.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications)
    setUnreadCount(data.notifications.filter(n => !n.read).length)
  }

  async function markAsRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ id })
    })
    fetchNotifications()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100/50 rounded-full transition-all"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-outline-variant/10">
              <h3 className="font-bold text-lg">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer ${
                    !notif.read ? 'bg-primary-fixed/30' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notif.type === 'critical' ? 'bg-error' :
                      notif.type === 'warning' ? 'bg-primary' : 'bg-secondary'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-semibold">{notif.title}</h4>
                      <p className="text-sm text-on-surface-variant">{notif.message}</p>
                      <span className="text-xs text-tertiary">{formatTime(notif.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## 8. Testing Strategy

### 8.1 E2E Testing with Playwright

```typescript
// tests/e2e/status-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Status Screen - Safe to Warning Flow', () => {
  test('should display safe status with low pollen', async ({ page }) => {
    // Login as mock user in safe mode
    await page.goto('/api/mock-user?mode=safe')
    await page.goto('/status')

    // Verify hero banner shows "safe" state
    await expect(page.locator('[data-testid="hero-banner"]')).toContainText("You're covered")
    await expect(page.locator('[data-testid="hero-banner"]')).toHaveCSS('background-image', /hero-safe/)

    // Verify Atmospheric Intelligence card shows "Excellent"
    await expect(page.locator('[data-testid="atmospheric-card"]')).toContainText('Excellent')
    await expect(page.locator('[data-testid="atmospheric-card"]')).toHaveCSS('border-color', 'transparent')
  })

  test('should transition to warning when pollen spikes', async ({ page, context }) => {
    await page.goto('/api/mock-user?mode=safe')
    await page.goto('/status')

    // Wait for initial render
    await page.waitForSelector('[data-testid="hero-banner"]')

    // Simulate API returning high pollen (mock service worker)
    await context.route('/api/environment*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          aqi: 180,
          pollenLevel: 'high'
        })
      })
    })

    // Trigger re-fetch (or wait for auto-refresh)
    await page.reload()

    // Verify hero banner transitions to warning
    await expect(page.locator('[data-testid="hero-banner"]')).toContainText('High Pollen detected')
    await expect(page.locator('[data-testid="hero-banner"]')).toHaveCSS('background-image', /hero-warning/)

    // Verify Atmospheric card has warning styling
    const atmCard = page.locator('[data-testid="atmospheric-card"]')
    await expect(atmCard).toHaveCSS('border-color', /rgba\(172, 48, 68, 0\.2\)/)
    await expect(atmCard).toHaveClass(/scale-102/)
  })

  test('should allow logging medication from warning state', async ({ page }) => {
    await page.goto('/api/mock-user?mode=warning')
    await page.goto('/status')

    // Click "Log Medication Dose" button in hero banner
    await page.click('[data-testid="hero-cta"]')

    // Should navigate to /log
    await expect(page).toHaveURL('/log')

    // Fill medication form
    await page.fill('[data-testid="medication-name"]', 'Cetirizine')
    await page.click('[data-testid="log-dose-button"]')

    // Should navigate back to status
    await expect(page).toHaveURL('/status')

    // Verify hero transitions back to safe
    await expect(page.locator('[data-testid="hero-banner"]')).toContainText("You're covered")
  })
})

test.describe('Card Status Independence', () => {
  test('should show warning on Treatment Window card while other cards remain safe', async ({ page, context }) => {
    // Mock: Good environment, but medication overdue
    await context.route('/api/environment*', route => {
      route.fulfill({ body: JSON.stringify({ aqi: 10, pollenLevel: 'low' }) })
    })
    await context.route('/api/intake*', route => {
      route.fulfill({ body: JSON.stringify({ lastMedicationTime: new Date(Date.now() - 26 * 60 * 60 * 1000) }) })
    })

    await page.goto('/status')

    // Atmospheric card should be safe
    await expect(page.locator('[data-testid="atmospheric-card"]')).not.toHaveClass(/border-primary/)

    // Treatment Window card should be warning
    await expect(page.locator('[data-testid="treatment-card"]')).toHaveClass(/border-primary/)
    await expect(page.locator('[data-testid="treatment-card"]')).toContainText('overdue')

    // Hero banner should aggregate to warning (because Treatment card is warning)
    await expect(page.locator('[data-testid="hero-banner"]')).toContainText('dose overdue')
  })
})
```

### 8.2 Unit Testing (Predictive Algorithm)

```typescript
// lib/__tests__/predictiveAlgorithm.test.ts
import { runPredictiveAlgorithm } from '../predictiveAlgorithm'

describe('Predictive Algorithm', () => {
  it('should return critical alert when no medication logged and high pollen', () => {
    const result = runPredictiveAlgorithm({
      lastMedicationTime: null,
      aqi: 50,
      pollenLevel: 'high'
    })

    expect(result.shouldAlert).toBe(true)
    expect(result.severity).toBe('critical')
    expect(result.reason).toContain('High pollen')
  })

  it('should return warning for pre-emptive strike scenario', () => {
    const result = runPredictiveAlgorithm({
      lastMedicationTime: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22h ago
      aqi: 30,
      pollenLevel: 'medium',
      pollenForecast: { pollenLevel: 'high' }
    })

    expect(result.shouldAlert).toBe(true)
    expect(result.severity).toBe('warning')
    expect(result.recommendedAction).toContain('Pre-emptive Strike')
  })

  it('should return info when all metrics are safe', () => {
    const result = runPredictiveAlgorithm({
      lastMedicationTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
      aqi: 12,
      pollenLevel: 'low'
    })

    expect(result.shouldAlert).toBe(false)
    expect(result.severity).toBe('info')
  })
})
```

### 8.3 Component Testing (Framer Motion Transitions)

```typescript
// components/__tests__/AtmosphericIntelligenceCard.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { AtmosphericIntelligenceCard } from '../AtmosphericIntelligenceCard'

describe('AtmosphericIntelligenceCard', () => {
  it('should animate from safe to warning state', async () => {
    const { rerender } = render(
      <AtmosphericIntelligenceCard
        status="safe"
        aqi={12}
        pollenLevel="low"
      />
    )

    const card = screen.getByTestId('atmospheric-card')
    expect(card).toHaveStyle({ borderColor: 'transparent' })

    // Trigger state change
    rerender(
      <AtmosphericIntelligenceCard
        status="warning"
        aqi={180}
        pollenLevel="high"
      />
    )

    // Wait for Framer Motion transition (600ms)
    await waitFor(() => {
      expect(card).toHaveStyle({ borderColor: 'rgba(172, 48, 68, 0.2)' })
    }, { timeout: 700 })
  })
})
```

---

## 9. Environment Configuration

### 9.1 `.env.local` (Development)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (via Supabase)
# Configure in Supabase Dashboard: Authentication > Providers > Google

# Weather API
WEATHER_API_KEY=your-weatherapi-key
WEATHER_API_BASE=https://api.weatherapi.com/v1

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mock User Mode (for local testing)
ENABLE_MOCK_USERS=true
```

### 9.2 `.env.production` (Vercel)

```bash
# Same as above, but with production URLs
NEXT_PUBLIC_APP_URL=https://health-guard.vercel.app
ENABLE_MOCK_USERS=false
```

### 9.3 Vercel Free Tier Optimization

- **Serverless Functions**: Limited to 10s execution time → Ensure API calls complete quickly
- **Edge Functions**: Use for `/api/environment` caching (faster, cheaper)
- **Image Optimization**: Serve hero images via Vercel Image CDN
- **Build Time**: Keep under 45 min by avoiding heavy dependencies

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google avatars
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    runtime: 'edge', // Use Edge Runtime for API routes where possible
  }
}
```

---

## 10. Deployment Strategy

### 10.1 Phase 1: Status Screen + Basic Log

**Timeline**: 2-3 weeks
**Deliverables**:
- Status screen with 5 cards (Atmospheric Intelligence, Treatment Window, Local Outlook, Aether Suggestion, Weekly Wellness)
- Card-level status evaluation system
- Hero banner aggregation
- Basic medication logging (/log screen with Quick Log cards)
- Google OAuth + Mock user system
- In-app notification dropdown
- Predictive algorithm (simple rule-based)
- E2E tests for critical flows

**Success Criteria**:
- User can log in with Google or mock account
- Status screen accurately reflects environmental + health data
- Cards transition smoothly between safe/warning/critical
- Predictive alerts appear in notification dropdown
- User can log medication dose via /log screen
- All E2E tests pass with >80% coverage

### 10.2 Phase 2: Trends Screen + Enhanced Analytics

**Deliverables**:
- Trends screen with medication history, sleep quality, cardio fitness
- Historical environmental data visualization
- Advanced predictive algorithm (weighted scoring)
- Symptom severity tracking (extend schema)

### 10.3 Phase 3: Settings + Integrations

**Deliverables**:
- Settings screen (messaging integrations, rules, bot config)
- External notification channels (Telegram/iMessage webhooks)
- Gmail/Calendar integration for Stitch AI
- Dark mode support

---

## 11. Future: Stitch AI Data Flow (Beyond POC)

### 11.1 Vision: "Digital Phenotype" Mapping

```
┌─────────────────────────────────────────────────────────┐
│                     Stitch AI Layer                       │
│  Aggregates disparate signals into coherent health story │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐    ┌────▼─────┐
    │ Gmail   │      │ Calendar  │    │ Wearable │
    │ Parsing │      │ Events    │    │ APIs     │
    └─────────┘      └───────────┘    └──────────┘
         │                 │                 │
         │  Prescription   │  Workout        │  Heart Rate,
         │  Reminders      │  Schedule       │  Sleep Stages
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                ┌──────────▼──────────┐
                │  Health Guard POC   │
                │  (Current Scope)    │
                └─────────────────────┘
```

### 11.2 Stitch API Architecture (Phase 4+)

```typescript
// app/api/stitch/aggregate/route.ts
/**
 * POST /api/stitch/aggregate
 *
 * "The Stitch Layer" - Combines multiple data sources into unified health profile.
 */
export async function POST(request: Request) {
  const { userId } = await request.json()

  // Parallel data fetching
  const [medicationLogs, calendarEvents, gmailPrescriptions, wearableData] = await Promise.all([
    fetchMedicationLogs(userId),
    fetchCalendarEvents(userId), // Google Calendar API
    parseGmailForPrescriptions(userId), // Gmail API with NLP
    fetchWearableData(userId) // Apple Health / Fitbit / Whoop
  ])

  // AI-powered synthesis
  const stitchedProfile = await synthesizeWithAI({
    medications: medicationLogs,
    schedule: calendarEvents,
    prescriptions: gmailPrescriptions,
    biometrics: wearableData
  })

  return Response.json({ profile: stitchedProfile })
}
```

---

## 12. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend Framework** | Next.js 14 (App Router) | Server components, excellent DX, Vercel optimization |
| **Database** | Supabase (PostgreSQL) | Managed Postgres + Auth + Real-time, rapid POC velocity |
| **Styling** | Tailwind CSS | Matches design mockups perfectly, utility-first for rapid iteration |
| **Animation** | Framer Motion | Industry-standard for React animations, excellent docs |
| **Auth** | Supabase Auth (Google OAuth) | Zero config, secure, handles session management |
| **Weather API** | WeatherAPI.com | Free tier with good pollen data, 1M calls/month |
| **Testing** | Playwright (E2E) + Jest (Unit) | Comprehensive coverage, mimics real user flows |
| **Deployment** | Vercel | Native Next.js support, zero-config, free tier sufficient |
| **State Management** | React Context + SWR | Lightweight, server-first data fetching |

---

## 13. Open Questions & Risks

### Open Questions
1. **WeatherAPI Pollen Data Accuracy**: Need to validate if pollen data is granular enough (some users report it's US-only). Fallback: Use mock pollen data for POC.
2. **Notification Timing**: Should predictive alerts run on-demand (user opens app) or via scheduled cron job (Vercel Cron)?
3. **Hero Image Storage**: Should we host the hero images (safe/warning) in Supabase Storage or use external CDN?

### Risks
| Risk | Mitigation |
|------|------------|
| **Weather API Rate Limits** | Implement 30-min caching + fallback to mock data if API fails |
| **Vercel Free Tier Limits** | Optimize build time, use Edge Runtime for API routes, lazy-load images |
| **Card Status Race Conditions** | Use React Suspense + SWR for coordinated data fetching |
| **Animation Performance** | Use `will-change` CSS property, GPU acceleration, debounce status changes |

---

## 14. Success Metrics (POC)

- **Visual Fidelity**: Pixel-perfect match to design mockups (measured via visual regression tests)
- **Performance**: Lighthouse score >90 on mobile
- **Reliability**: 99% uptime on Vercel, <500ms p95 API response time
- **Test Coverage**: >80% E2E coverage for critical flows
- **User Experience**: Smooth transitions (<16ms frame time during animations)

---

## 15. Next Steps

1. **Approve Architecture**: Review this document, clarify any ambiguities
2. **Initialize Repository**: Run `create-next-app`, configure Tailwind, install dependencies
3. **Setup Supabase Project**: Create tables, configure RLS, set up Google OAuth
4. **Extract Design Tokens**: Create `tailwind.config.ts` with exact colors from HTML
5. **Build Status Screen (Phase 1)**:
   - Implement card components (start with Atmospheric Intelligence)
   - Integrate Weather API
   - Build card status evaluation system
   - Create hero banner aggregation
6. **Add Medication Logging**: Basic /log screen with Quick Log cards
7. **E2E Testing**: Write Playwright tests for safe→warning→log flow
8. **Deploy to Vercel**: Set up preview/production environments

---

**Document Version**: 1.0
**Last Updated**: 2026-04-05
**Author**: Claude Opus 4.5 (Stitch AI Team)
**Status**: ✅ Ready for Review

---

