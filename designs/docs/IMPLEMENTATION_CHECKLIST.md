# Health Guard - Implementation Checklist

This document provides a step-by-step implementation guide for the Health Guard POC.

---

## Phase 1: Status Screen + Basic Logging (Primary Focus)

### 1. Project Setup

- [ ] Initialize Next.js 14 project with App Router
  ```bash
  npx create-next-app@latest health-guard --typescript --tailwind --app
  ```

- [ ] Install dependencies
  ```bash
  npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
  npm install framer-motion
  npm install date-fns
  npm install swr
  ```

- [ ] Install dev dependencies
  ```bash
  npm install -D @playwright/test
  npm install -D @testing-library/react @testing-library/jest-dom
  npm install -D prettier eslint-config-prettier
  ```

- [ ] Configure Tailwind with design tokens
  - Extract colors from `/designs/screens/*/code.html`
  - Set up custom theme in `tailwind.config.ts`
  - Add Material Symbols font

- [ ] Setup environment variables
  - Create `.env.local` and `.env.example`
  - Add Supabase credentials
  - Add Weather API key

### 2. Supabase Configuration

- [ ] Create Supabase project at [supabase.com](https://supabase.com)

- [ ] Run database migrations
  ```sql
  -- Create user_profiles table
  -- Create medication_logs table
  -- Create environmental_data table
  -- Create notifications table
  -- Create mock_users table
  -- Enable RLS policies
  ```

- [ ] Configure Google OAuth
  - Go to Authentication > Providers > Google
  - Add OAuth credentials
  - Set redirect URLs

- [ ] Test database connection
  ```typescript
  // Test in lib/supabase.ts
  import { createClient } from '@supabase/supabase-js'
  const supabase = createClient(url, key)
  ```

### 3. Design System Implementation

- [ ] Create reusable UI components
  - `components/ui/Button.tsx`
  - `components/ui/Card.tsx`
  - `components/ui/Badge.tsx`
  - `components/ui/Icon.tsx` (Material Symbols wrapper)

- [ ] Create shared layout components
  - `components/shared/TopNavBar.tsx` (match design exactly)
  - `components/shared/UserAvatar.tsx`
  - `components/shared/NotificationDropdown.tsx`

- [ ] Setup Framer Motion variants
  - `lib/animations.ts` (card transitions, hero banner morphing)

### 4. Authentication System

- [ ] Create auth routes
  - `app/api/auth/callback/route.ts` (OAuth callback)
  - `app/login/page.tsx` (Login screen)

- [ ] Implement mock user system
  - `app/api/mock-user/route.ts`
  - Create mock user middleware in `lib/mockUserMiddleware.ts`
  - Add cookie-based session for mock users

- [ ] Create AuthProvider
  - `components/providers/AuthProvider.tsx`
  - Handle real + mock user sessions

### 5. External API Integration

- [ ] Implement Weather API client
  - `lib/weatherAPI.ts`
  - Test with WeatherAPI.com free tier
  - Implement fallback for API failures

- [ ] Create environment API route
  - `app/api/environment/route.ts`
  - Implement 30-minute caching
  - Handle city parameter

- [ ] Test API integration
  - Verify pollen data accuracy
  - Test rate limiting behavior

### 6. Status Screen - Core Cards

#### 6.1 Hero Banner
- [ ] Create `app/(dashboard)/status/components/HeroBanner.tsx`
- [ ] Implement safe/warning state variants
- [ ] Add hero image transitions (Framer Motion)
- [ ] Create CTA button logic (links to /log)

#### 6.2 Atmospheric Intelligence Card
- [ ] Create `AtmosphericIntelligenceCard.tsx`
- [ ] Implement `evaluateStatus()` function
  - Check AQI thresholds
  - Check pollen levels
  - Return card state
- [ ] Add card animations (safe → warning)
- [ ] Display pollen breakdown (Grass, Tree, Weed, Ragweed)

#### 6.3 Treatment Window Card
- [ ] Create `TreatmentWindowCard.tsx`
- [ ] Implement `evaluateStatus()` function
  - Check last medication time
  - Calculate hours since last dose
  - Determine if overdue
- [ ] Add "Confirm Dosage" button
- [ ] Display countdown timer

#### 6.4 Local Outlook Card
- [ ] Create `LocalOutlookCard.tsx`
- [ ] Display city, temperature, weather condition
- [ ] Use hero image from Weather API
- [ ] Add location icon

#### 6.5 Aether Suggestion Card
- [ ] Create `AetherSuggestionCard.tsx`
- [ ] Implement contextual suggestions based on status
  - Safe: "Enjoy fresh air" + Plan Walk button
  - Warning: "Close windows" + "Purifier: Max Power"
- [ ] Add smart home integration hooks (future)

#### 6.6 Weekly Wellness Card
- [ ] Create `WeeklyWellnessCard.tsx`
- [ ] Mock data for POC (sleep, active hours, hydration)
- [ ] Display percentage changes
- [ ] Plan for real data integration (Phase 2)

### 7. Card Status Orchestration

- [ ] Create StatusProvider
  - `components/providers/StatusProvider.tsx`
  - Fetch environmental data on mount
  - Fetch user medication logs
  - Compute card statuses in parallel
  - Aggregate hero banner status

- [ ] Implement status evaluation engine
  - `lib/statusEvaluator.ts`
  - Call each card's `evaluateStatus()` function
  - Return array of `CardState` objects

- [ ] Add auto-refresh logic
  - Poll every 5 minutes for environmental updates
  - Use SWR for data fetching

### 8. Predictive Algorithm

- [ ] Create predictive algorithm
  - `lib/predictiveAlgorithm.ts`
  - Implement simple rule-based logic
  - Rules:
    1. No med + high pollen = CRITICAL
    2. Overdue med (>24h) + medium+ pollen = CRITICAL
    3. Dose window (20-24h) + forecast spike = WARNING
    4. Hazardous AQI (>300) = CRITICAL
    5. Elevated AQI (150-300) = WARNING

- [ ] Create predict API route
  - `app/api/predict/route.ts`
  - Run algorithm on POST request
  - Create notification if alert needed

- [ ] Unit tests for algorithm
  - `lib/__tests__/predictiveAlgorithm.test.ts`
  - Test all 5 rules
  - Edge cases (null values, boundary conditions)

### 9. Medication Logging

- [ ] Create Log screen
  - `app/(dashboard)/log/page.tsx`
  - Implement "Zero-UI" text input (large textarea)
  - Add Quick Log cards (Medicine, Hydration, Gym)

- [ ] Create intake API route
  - `app/api/intake/route.ts`
  - Validate input
  - Insert into `medication_logs` table
  - Trigger status re-evaluation

- [ ] Create Quick Log components
  - `QuickLogCard.tsx` (Medicine card with "Log Dose Taken" button)
  - Handle form submission
  - Show success toast

- [ ] Create Recent Activity List
  - `RecentActivityList.tsx`
  - Display last 10 logs
  - Show time elapsed ("2 hours ago")

### 10. In-App Notifications

- [ ] Create notifications API routes
  - `app/api/notifications/route.ts` (GET for list, PATCH for mark read)

- [ ] Implement NotificationDropdown
  - `components/shared/NotificationDropdown.tsx`
  - Show unread count badge
  - Dropdown with notification list
  - Mark as read on click

- [ ] Seed test notifications
  - Create migration to insert sample notifications for mock users

### 11. Status Screen Integration

- [ ] Create main Status page
  - `app/(dashboard)/status/page.tsx`
  - Wrap in StatusProvider
  - Render all cards in bento grid layout
  - Match design mockup spacing/sizing

- [ ] Implement responsive layout
  - Mobile: Stack cards vertically
  - Desktop: 12-column grid (match mockups)

- [ ] Add loading states
  - Skeleton loaders for cards
  - Suspense boundaries

### 12. Testing

#### E2E Tests (Playwright)
- [ ] Setup Playwright config
  - `playwright.config.ts`
  - Configure browsers, base URL

- [ ] Write critical flow tests
  - `tests/e2e/status-flow.spec.ts`
    - Safe status display
    - Safe → Warning transition
    - Logging medication from warning state
  - `tests/e2e/card-independence.spec.ts`
    - Individual card status changes

- [ ] Write notification tests
  - `tests/e2e/notifications.spec.ts`
    - Notification appears after prediction
    - Mark as read functionality

#### Unit Tests
- [ ] Test predictive algorithm
  - `lib/__tests__/predictiveAlgorithm.test.ts`

- [ ] Test card evaluation logic
  - `components/__tests__/AtmosphericIntelligenceCard.test.tsx`
  - `components/__tests__/TreatmentWindowCard.test.tsx`

#### Component Tests
- [ ] Test animation transitions
  - Mock Framer Motion
  - Verify CSS changes

### 13. Deployment

- [ ] Create Vercel project
  - Connect GitHub repo
  - Configure environment variables
  - Enable automatic deployments

- [ ] Optimize for Vercel free tier
  - Use Edge Runtime for API routes where possible
  - Enable Image Optimization
  - Keep build under 45 minutes

- [ ] Setup preview environments
  - Test on preview URLs before production
  - Run E2E tests on preview

- [ ] Production deployment
  - Verify environment variables
  - Test OAuth callback URLs
  - Run smoke tests

### 14. Documentation

- [ ] Add README.md
  - Project overview
  - Setup instructions
  - Mock user guide

- [ ] Document API routes
  - OpenAPI/Swagger spec (optional)

- [ ] Add code comments
  - Complex logic (predictive algorithm)
  - Card evaluation functions

---

## Phase 2: Trends Screen (Future)

- [ ] Create Trends page (`app/(dashboard)/trends/page.tsx`)
- [ ] Implement medication history visualization
- [ ] Add health metrics cards (Sleep, Cardio, Pollen Exposure)
- [ ] Extend schema for symptom severity tracking

---

## Phase 3: Settings Screen (Future)

- [ ] Create Settings page (`app/(dashboard)/settings/page.tsx`)
- [ ] Implement messaging integrations UI
- [ ] Add rules toggles
- [ ] Build Stitch Bot configuration panel

---

## Verification Checklist (Before Handoff)

- [ ] Visual fidelity: Status screen matches mockup pixel-perfectly
- [ ] All cards transition smoothly between states
- [ ] Medication logging works end-to-end
- [ ] Notifications appear in dropdown
- [ ] Mock users work without authentication
- [ ] E2E tests pass with >80% coverage
- [ ] Deployed to Vercel and publicly accessible
- [ ] Lighthouse score >90 on mobile
- [ ] No console errors or warnings

---

## Estimated Timeline

| Phase | Task | Estimated Hours |
|-------|------|-----------------|
| 1 | Project Setup + Supabase | 4h |
| 2 | Design System + UI Components | 8h |
| 3 | Authentication + Mock Users | 4h |
| 4 | Weather API Integration | 3h |
| 5 | Status Screen - Hero + 2 Cards | 8h |
| 6 | Status Screen - Remaining Cards | 8h |
| 7 | Card Status Orchestration | 6h |
| 8 | Predictive Algorithm | 4h |
| 9 | Medication Logging | 6h |
| 10 | In-App Notifications | 4h |
| 11 | Integration + Polish | 6h |
| 12 | Testing (E2E + Unit) | 8h |
| 13 | Deployment + Bug Fixes | 4h |
| **Total** | | **73h (~2 weeks full-time)** |

---

**Note**: This timeline assumes a single developer working full-time. Adjust based on your availability and experience level.
