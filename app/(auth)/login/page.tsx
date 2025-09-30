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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-info-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card shadow-lift text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-success-100 to-success-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-4xl">✉️</span>
              </div>
              <h1 className="text-3xl font-bold mb-3 text-gray-900">Check Your Email</h1>
              <p className="text-gray-600">
                We sent a magic link to <strong className="text-primary-600">{email}</strong>
              </p>
            </div>

            <div className="bg-info-50 border border-info-200 p-5 rounded-lg text-sm text-left mb-6">
              <p className="font-semibold mb-3 text-info-900 flex items-center gap-2">
                <span className="text-lg">📋</span>
                Next steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Open your email inbox</li>
                <li>Click the magic link in the email</li>
                <li>You'll be automatically logged in</li>
              </ol>
            </div>

            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary-600 hover:underline font-semibold"
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-info-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-info-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600 mb-2">AlbaniaRides</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600">
            Login to continue your ridesharing journey
          </p>
        </div>
      </div>

      <div className="relative mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card shadow-lift py-10 px-6 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || authError) && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span className="text-sm">
                  {authError === 'auth_failed' && 'Authentication failed. Please try again.'}
                  {authError === 'no_code' && 'Invalid login link. Please request a new one.'}
                  {error}
                </span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>🔐</span>
                We'll send you a magic link to login
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base font-semibold"
            >
              {loading ? '✉️ Sending...' : '✉️ Send Magic Link'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push('/register')}
                className="w-full btn-secondary py-3 font-semibold"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By logging in, you agree to our{' '}
          <a href="/terms" className="link-hover font-medium">Terms</a> and{' '}
          <a href="/privacy" className="link-hover font-medium">Privacy Policy</a>
        </p>
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