'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/validation'

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

export default function RidesPage() {
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
            {origin} → {destination}
          </h1>
          {date && (
            <p className="text-gray-600">
              {formatDate(date)}
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Searching for rides...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && rides.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No rides found for this route.</p>
            <a href="/" className="btn-secondary inline-block">
              Search Again
            </a>
          </div>
        )}

        {!loading && !error && rides.length > 0 && (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride.id} className="card hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Driver Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      {ride.driver.photo_url ? (
                        <img
                          src={ride.driver.photo_url}
                          alt={ride.driver.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-500">👤</span>
                      )}
                    </div>
                  </div>

                  {/* Ride Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{ride.driver.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⭐ {ride.driver.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span>{ride.driver.total_rides} rides</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary-600">
                          {formatCurrency(ride.price_per_seat)}
                        </div>
                        <div className="text-xs text-gray-500">per seat</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex gap-2">
                        <span>📅</span>
                        <span>{formatDate(ride.departure_time)}</span>
                        <span>•</span>
                        <span>{formatTime(ride.departure_time)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span>📍</span>
                        <span>{ride.pickup_point}</span>
                      </div>
                      <div className="flex gap-2">
                        <span>💺</span>
                        <span>{ride.seats_available} seats available</span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button className="btn-primary">
                        Book Now
                      </button>
                      <div className="text-sm text-gray-500 flex items-center">
                        💵 Cash payment only
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