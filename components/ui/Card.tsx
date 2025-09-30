import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  clickable?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', clickable = false, onClick }: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow-md border border-gray-200'
  const clickableStyles = clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''

  return (
    <div
      className={`${baseStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}