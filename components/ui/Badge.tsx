import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'safe' | 'warning' | 'critical' | 'ghost'
  className?: string
}

export default function Badge({ children, variant = 'ghost', className }: BadgeProps) {
  const variants = {
    safe: 'bg-secondary/10 text-secondary border border-secondary/20',
    warning: 'bg-primary/10 text-primary border border-primary/20',
    critical: 'bg-error/10 text-error border border-error/30',
    ghost: 'bg-white/20 text-white backdrop-blur-md',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold tracking-widest uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
