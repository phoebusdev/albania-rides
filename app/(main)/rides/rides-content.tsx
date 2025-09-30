'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/validation'
import { ALBANIAN_CITIES } from '@/lib/constants/cities'

interface Ride {
  id: string
  origin_city: string
  destination_city: string
  departure_time: string
  price_per_seat: number
  seats_available: number
  pickup_point: string
  driver: {
    name: string
    photo_url?: string
    rating: number
    total_rides: number
  }
}

export default function RidesContent() {
  const searchParams = useSearchParams()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''

  useEffect(() => {
    fetchRides()
  }, [origin, destination, date])

  const fetchRides = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        origin,
        destination,
        ...(date && { date })
      })

      const response = await fetch(`/api/rides?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rides')
      }

      setRides(data.rides || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCityName = (code: string) => {
    const city = ALBANIAN_CITIES.find(c => c.code === code)
    return city?.name || code
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="text-2xl font-bold text-primary-600">AlbaniaRides</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {getCityName(origin)} → {getCityName(destination)}
          </h1>
          {date && (
            <p className="text-gray-600">
              {formatDate(date)}
            </p>
          )}
        </div>

        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="flex gap-5 animate-pulse">
                  <div className="skeleton w-20 h-20 rounded-full"></div>
                  <div className="flex-grow space-y-3">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="skeleton h-5 w-32 rounded"></div>
                        <div className="skeleton h-4 w-24 rounded"></div>
                      </div>
                      <div className="skeleton h-10 w-24 rounded-lg"></div>
                    </div>
                    <div className="skeleton h-px w-full"></div>
                    <div className="space-y-2">
                      <div className="skeleton h-4 w-48 rounded"></div>
                      <div className="skeleton h-4 w-36 rounded"></div>
                      <div className="skeleton h-4 w-28 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="card border-l-4 border-red-500 bg-red-50">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-900 mb-1">Error Loading Rides</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && rides.length === 0 && (
          <div className="card text-center py-16">
            <div className="max-w-sm mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Rides Found</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We couldn't find any rides for this route. Try adjusting your search or check back later.
              </p>
              <a href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                🔍 Search Again
              </a>
            </div>
          </div>
        )}

        {!loading && !error && rides.length > 0 && (
          <div className="space-y-5">
            {rides.map((ride) => (
              <div key={ride.id} className="card-hover">
                <div className="flex gap-5">
                  {/* Driver Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-2 ring-white shadow-soft">
                      {ride.driver.photo_url ? (
                        <img
                          src={ride.driver.photo_url}
                          alt={ride.driver.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-gray-500">👤</span>
                      )}
                    </div>
                  </div>

                  {/* Ride Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{ride.driver.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-warning-600 font-semibold">
                            {'⭐'.repeat(Math.round(ride.driver.rating))}
                            <span className="text-gray-600 ml-1">{ride.driver.rating.toFixed(1)}</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{ride.driver.total_rides} trips</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-baseline bg-primary-600 text-white px-4 py-2 rounded-lg shadow-soft">
                          <span className="text-2xl font-bold">{formatCurrency(ride.price_per_seat)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">per seat</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mb-3"></div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-lg">📅</span>
                        <span className="font-medium">{formatDate(ride.departure_time)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium">{formatTime(ride.departure_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-lg">📍</span>
                        <span>{ride.pickup_point}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-lg">💺</span>
                        <span className="font-medium">{ride.seats_available} seats available</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-4"></div>

                    <div className="flex items-center gap-3">
                      <button className="btn-primary flex-1 md:flex-initial md:px-8 py-3 text-base font-semibold">
                        Book Now
                      </button>
                      <div className="flex items-center gap-2 bg-warning-50 border border-warning-200 px-3 py-2 rounded-lg">
                        <span className="text-lg">💵</span>
                        <span className="text-xs font-medium text-warning-800">Cash only</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}