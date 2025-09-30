'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALBANIAN_CITIES, POPULAR_ROUTES } from '@/lib/constants/cities'

export default function HomePage() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (origin && destination) {
      const params = new URLSearchParams({
        origin,
        destination,
        ...(date && { date })
      })
      router.push(`/rides?${params}`)
    }
  }

  const handleQuickRoute = (from: string, to: string) => {
    setOrigin(from)
    setDestination(to)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">AlbaniaRides</h1>
            <nav className="flex gap-4">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-primary-600"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="btn-primary px-4 py-2"
              >
                Sign Up
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-primary-100/30 to-white py-16 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Travel Together Across Albania
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-3 max-w-2xl mx-auto">
            Connect with drivers and passengers for intercity travel
          </p>
          <div className="inline-flex items-center gap-2 bg-warning-100 border border-warning-200 px-4 py-2 rounded-lg mb-10">
            <span className="text-2xl">💵</span>
            <span className="text-sm font-semibold text-warning-800">Cash payment only - Pay driver directly</span>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="card max-w-2xl mx-auto shadow-lift">
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select city</option>
                    {ALBANIAN_CITIES.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select city</option>
                    {ALBANIAN_CITIES.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date (optional)
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                />
              </div>

              <button type="submit" className="btn-primary w-full text-lg py-3 font-semibold">
                🔍 Search Rides
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Routes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                onClick={() => handleQuickRoute(route.from, route.to)}
                className="card-hover text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-900">
                    {route.fromName}
                  </span>
                  <span className="text-primary-500 transform group-hover:translate-x-1 transition-transform duration-150">
                    →
                  </span>
                  <span className="font-semibold text-lg text-gray-900">
                    {route.toName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    🛣️ {route.distance} km
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    ⏱️ ~{route.duration} min
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-info-100 to-info-200 rounded-full flex items-center justify-center mx-auto shadow-soft group-hover:shadow-lift transition-all duration-150">
                  <span className="text-3xl">🔍</span>
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-info-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Search Rides</h3>
              <p className="text-gray-600 leading-relaxed">
                Find available rides between Albanian cities with dates and prices
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-success-100 to-success-200 rounded-full flex items-center justify-center mx-auto shadow-soft group-hover:shadow-lift transition-all duration-150">
                  <span className="text-3xl">📱</span>
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-success-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Book Instantly</h3>
              <p className="text-gray-600 leading-relaxed">
                Reserve your seat and get driver contact information
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-warning-100 to-warning-200 rounded-full flex items-center justify-center mx-auto shadow-soft group-hover:shadow-lift transition-all duration-150">
                  <span className="text-3xl">💵</span>
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-warning-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Pay in Cash</h3>
              <p className="text-gray-600 leading-relaxed">
                Pay the driver directly when you meet - simple and secure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 border-t-4 border-primary-600">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">AlbaniaRides</h3>
            <p className="text-gray-400 text-sm">Connection platform for ridesharing across Albania</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a href="/faq" className="text-gray-300 hover:text-white hover:underline underline-offset-4 transition-colors duration-150">
              FAQ
            </a>
            <a href="/safety" className="text-gray-300 hover:text-white hover:underline underline-offset-4 transition-colors duration-150">
              Safety Tips
            </a>
            <a href="/terms" className="text-gray-300 hover:text-white hover:underline underline-offset-4 transition-colors duration-150">
              Terms
            </a>
            <a href="/privacy" className="text-gray-300 hover:text-white hover:underline underline-offset-4 transition-colors duration-150">
              Privacy
            </a>
          </div>

          <div className="text-center text-gray-400 text-sm border-t border-gray-800 pt-6">
            <p>© 2024 AlbaniaRides. Platform for rideshare connections only.</p>
            <p className="mt-2 text-xs">We are not responsible for actual rides or cash transactions.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}