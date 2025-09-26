'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALBANIAN_CITIES } from '@/lib/constants/cities'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    city: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store phone for verification page
      sessionStorage.setItem('pendingPhone', formData.phone)
      router.push('/verify')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    // Remove non-digits
    let phone = value.replace(/\D/g, '')

    // Add +355 if not present
    if (!phone.startsWith('355')) {
      if (phone.startsWith('0')) {
        phone = '355' + phone.substring(1)
      } else if (phone.length > 0) {
        phone = '355' + phone
      }
    }

    return phone ? '+' + phone : ''
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-gray-600 mt-2">
              Join AlbaniaRides to share rides across Albania
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  phone: formatPhone(e.target.value)
                })}
                placeholder="+355 6x xxx xxxx"
                className="input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Albanian numbers only (+355)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                minLength={2}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City of Residence
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
                required
              >
                <option value="">Select your city</option>
                {ALBANIAN_CITIES.map((city) => (
                  <option key={city.code} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          By registering, you agree to our{' '}
          <a href="/terms" className="underline">Terms</a> and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}