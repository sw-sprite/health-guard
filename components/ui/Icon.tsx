'use client'

interface IconProps {
  name: string
  filled?: boolean
  size?: number
  className?: string
}

export default function Icon({ name, filled = false, size = 24, className = '' }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined${filled ? ' filled' : ''} ${className}`}
      style={{ fontSize: size, lineHeight: 1, width: size, height: size }}
    >
      {name}
    </span>
  )
}
