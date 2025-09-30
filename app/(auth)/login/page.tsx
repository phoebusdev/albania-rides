'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Check for error from callback
  const authError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Show success message
      setSuccess(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
              <p className="text-gray-600">
                We sent a magic link to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-left mb-6">
              <p className="font-semibold mb-2">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Open your email inbox</li>
                <li>Click the magic link in the email</li>
                <li>You'll be automatically logged in</li>
              </ol>
            </div>

            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary-600 hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Login to AlbaniaRides
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || authError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {authError === 'auth_failed' && 'Authentication failed. Please try again.'}
                {authError === 'no_code' && 'Invalid login link. Please request a new one.'}
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send you a magic link to login
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push('/register')}
                className="w-full btn-secondary"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}