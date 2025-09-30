'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-2.5 border rounded-lg min-h-touch
              appearance-none bg-white
              transition-all duration-150
              focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select'

export default Select