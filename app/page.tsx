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
      <section className="bg-gradient-to-b from-primary-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Travel Together Across Albania
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Connect with drivers and passengers for intercity travel.
            <span className="font-semibold"> Cash payment only.</span>
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="card max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <option key={city.code} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <option key={city.code} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <button type="submit" className="btn-primary w-full">
                Search Rides
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Popular Routes</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                onClick={() => handleQuickRoute(route.from, route.to)}
                className="card hover:shadow-md transition-shadow text-left"
              >
                <div className="font-semibold">
                  {route.from} → {route.to}
                </div>
                <div className="text-sm text-gray-600">
                  {route.distance} km • ~{route.duration} min
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h4 className="font-semibold mb-2">Search Rides</h4>
              <p className="text-gray-600">
                Find available rides between Albanian cities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold mb-2">Book Instantly</h4>
              <p className="text-gray-600">
                Reserve your seat and get driver contact
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💵</span>
              </div>
              <h4 className="font-semibold mb-2">Pay in Cash</h4>
              <p className="text-gray-600">
                Pay the driver directly when you meet
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-4">© 2024 AlbaniaRides. Connection platform only.</p>
          <div className="flex justify-center gap-6">
            <a href="/faq" className="hover:underline">FAQ</a>
            <a href="/safety" className="hover:underline">Safety Tips</a>
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}