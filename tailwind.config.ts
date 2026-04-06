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
        'primary': '#ac3044',
        'primary-container': '#ff6e7f',
        'on-primary': '#ffffff',
        'primary-fixed': '#ffdadb',
        'primary-fixed-dim': '#ffb2b7',
        'on-primary-container': '#70001f',

        'secondary': '#3b6476',
        'secondary-container': '#bfe9ff',
        'on-secondary': '#ffffff',
        'secondary-fixed': '#bfe9ff',
        'secondary-fixed-dim': '#a3cce2',
        'on-secondary-container': '#416a7c',

        'tertiary': '#595f68',
        'tertiary-container': '#989ea8',
        'on-tertiary': '#ffffff',
        'tertiary-fixed': '#dde3ed',
        'tertiary-fixed-dim': '#c1c7d1',
        'on-tertiary-container': '#2f353e',

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

        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        'on-surface': '#161c23',
        'on-surface-variant': '#584142',
        'on-background': '#161c23',

        'outline': '#8b7172',
        'outline-variant': '#dfbfc0',

        'inverse-surface': '#2b3139',
        'inverse-on-surface': '#ecf1fc',
        'inverse-primary': '#ffb2b7',
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        navbar: '0 8px 30px rgb(0,0,0,0.04)',
        card: '0 20px 40px rgba(22,28,35,0.03)',
        'card-hover': '0 20px 40px rgba(22,28,35,0.08)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}

export default config
