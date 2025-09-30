'use client'

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, prefix, suffix, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 border rounded-lg min-h-touch
              transition-all duration-150
              focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}
              ${prefix ? 'pl-10' : ''}
              ${suffix ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input