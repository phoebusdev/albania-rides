'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] inline-flex items-center justify-center gap-2'

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-soft focus:ring-primary-500 disabled:bg-primary-300 disabled:shadow-none',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 hover:shadow-soft focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 focus:ring-red-500 disabled:bg-red-25 disabled:text-red-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400 disabled:hover:bg-transparent'
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]'
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className} ${(disabled || loading) ? 'cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  )
}