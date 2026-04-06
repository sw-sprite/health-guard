# Health Guard - Design Tokens Reference

This document extracts all design tokens from the HTML mockups for use in Tailwind configuration.

---

## Tailwind Config (Copy-Paste Ready)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary (Health Alerts / Critical CTAs)
        'primary': '#ac3044',
        'primary-container': '#ff6e7f',
        'on-primary': '#ffffff',
        'primary-fixed': '#ffdadb',
        'primary-fixed-dim': '#ffb2b7',
        'on-primary-container': '#70001f',
        'on-primary-fixed': '#40000e',
        'on-primary-fixed-variant': '#8b152e',
        'inverse-primary': '#ffb2b7',

        // Secondary (Environmental / Info)
        'secondary': '#3b6476',
        'secondary-container': '#bfe9ff',
        'on-secondary': '#ffffff',
        'secondary-fixed': '#bfe9ff',
        'secondary-fixed-dim': '#a3cce2',
        'on-secondary-container': '#416a7c',
        'on-secondary-fixed': '#001f2a',
        'on-secondary-fixed-variant': '#214c5d',

        // Tertiary (Neutral / Metadata)
        'tertiary': '#595f68',
        'tertiary-container': '#989ea8',
        'on-tertiary': '#ffffff',
        'tertiary-fixed': '#dde3ed',
        'tertiary-fixed-dim': '#c1c7d1',
        'on-tertiary-container': '#2f353e',
        'on-tertiary-fixed': '#161c23',
        'on-tertiary-fixed-variant': '#414750',

        // Surfaces
        'background': '#f8f9ff',
        'surface': '#f8f9ff',
        'surface-dim': '#d5dae5',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eef4ff',
        'surface-container': '#e9eef9',
        'surface-container-high': '#e3e8f3',
        'surface-container-highest': '#dde3ed',
        'surface-variant': '#dde3ed',
        'surface-tint': '#ac3044',

        // Semantic
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        // Text
        'on-surface': '#161c23',
        'on-surface-variant': '#584142',
        'on-background': '#161c23',

        // Borders
        'outline': '#8b7172',
        'outline-variant': '#dfbfc0',

        // Inverse
        'inverse-surface': '#2b3139',
        'inverse-on-surface': '#ecf1fc',
      },

      borderRadius: {
        'DEFAULT': '1rem',    // 16px - standard cards
        'lg': '2rem',         // 32px - hero sections
        'xl': '3rem',         // 48px - major containers
        'full': '9999px',     // buttons, pills, avatars
      },

      fontFamily: {
        'headline': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'], // Default
      },

      boxShadow: {
        'navbar': '0 8px 30px rgb(0,0,0,0.04)',
        'card': '0 20px 40px rgba(22,28,35,0.03)',
        'card-hover': '0 20px 40px rgba(22,28,35,0.08)',
      },

      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## Typography Scale

```typescript
// Typography mapping from mockups

const typography = {
  // Hero Headlines
  hero: {
    fontSize: '3.75rem', // 60px (desktop)
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },

  // Page Titles
  h1: {
    fontSize: '3rem', // 48px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },

  // Section Titles
  h2: {
    fontSize: '1.5rem', // 24px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },

  // Card Titles
  h3: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },

  // Body Large
  bodyLarge: {
    fontSize: '1.125rem', // 18px
    fontWeight: 400,
    lineHeight: 1.6,
  },

  // Body Default
  body: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // Body Small
  bodySmall: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // Caption / Metadata
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 500,
    lineHeight: 1.4,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  // Overline (Smallest)
  overline: {
    fontSize: '0.625rem', // 10px
    fontWeight: 700,
    lineHeight: 1.6,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
  },
}
```

---

## Component-Specific Styles

### Glass Card Effect

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

**Usage in Tailwind**:
```tsx
<div className="bg-white/70 backdrop-blur-glass" />
```

### Top Navigation Bar

```tsx
<nav className="fixed top-0 w-full z-50 px-6 py-3 bg-white/80 backdrop-blur-xl shadow-navbar">
  {/* Content */}
</nav>
```

### Material Symbols Icons

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Filled variant */
.material-symbols-outlined.filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

**HTML Import**:
```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
  rel="stylesheet"
/>
```

### Card States (Framer Motion)

```typescript
// Safe State
const safeCardStyle = {
  backgroundColor: '#e3e8f3', // surface-container-high
  borderColor: 'transparent',
  borderWidth: '2px',
  scale: 1,
}

// Warning State
const warningCardStyle = {
  backgroundColor: 'rgba(255, 110, 127, 0.1)', // primary-container/10
  borderColor: 'rgba(172, 48, 68, 0.2)', // primary/20
  borderWidth: '2px',
  scale: 1.02,
}

// Critical State
const criticalCardStyle = {
  backgroundColor: 'rgba(186, 26, 26, 0.05)', // error/5
  borderColor: 'rgba(186, 26, 26, 0.4)', // error/40
  borderWidth: '2px',
  scale: 1.02,
  boxShadow: '0 0 30px rgba(186, 26, 26, 0.3)',
}
```

---

## Status-Specific Colors

### Safe Status
- Hero Background: Teal mountains (`/images/hero-safe.jpg`)
- Primary Color: `secondary` (#3b6476)
- Badge: White with soft blue gradient

### Warning Status
- Hero Background: Orange pollen (`/images/hero-warning.jpg`)
- Primary Color: `primary` (#ac3044)
- Badge: White/20 with warning icon

---

## Bento Grid Layout

```tsx
// Status Screen Grid (Desktop)
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
  {/* Atmospheric Intelligence - 2/3 width */}
  <div className="md:col-span-8">
    {/* Card content */}
  </div>

  {/* Local Outlook - 1/3 width */}
  <div className="md:col-span-4">
    {/* Card content */}
  </div>

  {/* Treatment Window - 1/3 width */}
  <div className="md:col-span-4">
    {/* Card content */}
  </div>

  {/* Aether Suggestion - 1/3 width */}
  <div className="md:col-span-4">
    {/* Card content */}
  </div>

  {/* Weekly Wellness - 1/3 width */}
  <div className="md:col-span-4">
    {/* Card content */}
  </div>
</div>
```

---

## Animation Timings

```typescript
// Standard easing
const easeInOut = [0.4, 0.0, 0.2, 1]

// Durations (ms)
const DURATION_FAST = 300
const DURATION_NORMAL = 600
const DURATION_SLOW = 1200

// Card transitions
const cardTransition = {
  duration: DURATION_NORMAL / 1000, // Convert to seconds for Framer Motion
  ease: easeInOut,
}

// Hero banner transitions
const heroTransition = {
  duration: DURATION_SLOW / 1000,
  ease: easeInOut,
}

// Button hover
const buttonHover = {
  scale: 1.05,
  transition: { duration: DURATION_FAST / 1000 },
}

// Button active
const buttonActive = {
  scale: 0.95,
  transition: { duration: DURATION_FAST / 1000 },
}
```

---

## Responsive Breakpoints

```typescript
// Match Tailwind defaults
const breakpoints = {
  sm: '640px',  // Mobile landscape
  md: '768px',  // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop
  '2xl': '1536px', // Extra large
}

// Usage in components
// Mobile: col-span-1 (stack vertically)
// Tablet+: md:col-span-X (bento grid)
```

---

## Z-Index Scale

```typescript
const zIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  overlay: 20,
  modal: 30,
  notification: 40,
  navbar: 50,
  tooltip: 60,
}
```

---

## Background Gradients

### Hero Banner (Safe)
```css
background: linear-gradient(
  to top,
  rgba(59, 100, 118, 0.8),  /* secondary/80 */
  rgba(59, 100, 118, 0.2),  /* secondary/20 */
  transparent
);
```

### Hero Banner (Warning)
```css
background: linear-gradient(
  to right,
  rgba(172, 48, 68, 0.9),   /* primary/90 */
  rgba(255, 110, 127, 0.6), /* primary-container/60 */
  transparent
);
```

### Glass Glow (Trends Screen)
```css
background: radial-gradient(
  circle at top left,
  rgba(255, 110, 127, 0.08),
  transparent 40%
),
radial-gradient(
  circle at bottom right,
  rgba(191, 233, 255, 0.15),
  transparent 40%
);
```

---

## Button Variants

### Primary CTA (Safe State)
```tsx
<button className="px-8 py-4 bg-secondary text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
  Plan Walk
</button>
```

### Primary CTA (Warning State)
```tsx
<button className="px-8 py-4 bg-white text-primary rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
  Log Medication Dose
</button>
```

### Secondary Button
```tsx
<button className="px-8 py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-bold hover:bg-white/30 transition-all active:scale-95">
  Dismiss
</button>
```

### Icon Button (Navbar)
```tsx
<button className="p-2 hover:bg-slate-100/50 rounded-full transition-all scale-95 active:opacity-80">
  <span className="material-symbols-outlined">settings</span>
</button>
```

---

## Quick Copy-Paste Snippets

### Card Wrapper
```tsx
<div className="bg-surface-container-low rounded-xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
  {/* Card content */}
</div>
```

### Section Title
```tsx
<h2 className="text-2xl font-bold tracking-tight text-on-surface">
  Section Title
</h2>
```

### Caption / Metadata
```tsx
<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
  Label Text
</p>
```

### Badge
```tsx
<span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-widest uppercase">
  Safe Window
</span>
```

### Avatar
```tsx
<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
  <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
</div>
```

---

## Asset Requirements

### Hero Images
- **Safe Status**: Teal/blue mountains in mist (aspect ratio 21:9, min width 1920px)
- **Warning Status**: Orange pollen particles (aspect ratio 21:9, min width 1920px)

### Icons
- Use Material Symbols Outlined font (no custom SVGs needed)
- Weight: 400
- Optical size: 24px
- Fill: 0 (default), 1 (filled variant)

---

## Google Fonts Import

```html
<!-- Add to app/layout.tsx or _document.tsx -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
  rel="stylesheet"
/>
```

Or use Next.js Font Optimization:
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

---

**Last Updated**: 2026-04-05
**Source**: `/health_guard/designs/screens/*/code.html`
