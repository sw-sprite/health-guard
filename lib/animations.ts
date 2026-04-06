import type { Variants } from 'framer-motion'

export const cardVariants: Variants = {
  safe: {
    backgroundColor: 'rgba(227, 232, 243, 1)',
    borderColor: 'transparent',
    scale: 1,
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  warning: {
    backgroundColor: 'rgba(255, 110, 127, 0.08)',
    borderColor: 'rgba(172, 48, 68, 0.2)',
    scale: 1,
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  critical: {
    backgroundColor: 'rgba(186, 26, 26, 0.06)',
    borderColor: 'rgba(186, 26, 26, 0.35)',
    scale: 1,
    boxShadow: '0 0 30px rgba(186, 26, 26, 0.15)',
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
}

export const heroBannerVariants: Variants = {
  safe: { opacity: 1, transition: { duration: 1.2, ease: 'easeInOut' } },
  warning: { opacity: 1, transition: { duration: 1.2, ease: 'easeInOut' } },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const pulseWarning = {
  animate: {
    opacity: [1, 0.92, 1],
    transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
  },
}

export const buttonHover = { scale: 1.04, transition: { duration: 0.15 } }
export const buttonTap = { scale: 0.96 }
