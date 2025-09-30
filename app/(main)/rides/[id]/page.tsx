'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

export default function RideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingModal, setBookingModal] = useState(false)
  const [seatsCount, setSeatsCount] = useState(1)
  const [message, setMessage] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetchRide()
  }, [params.id])

  const fetchRide = async () => {
    try {
      const response = await fetch(`/api/rides/${params.id}`)
      const data = await response.json()
      if (data.ride) {
        setRide(data.ride)
      }
    } catch (error) {
      console.error('Failed to fetch ride:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    setBooking(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ride_id: params.id,
          seats_count: seatsCount,
          message
        })
      })

      if (response.ok) {
        alert('Booking confirmed! Check your phone for details.')
        router.push('/trips')
      } else {
        const data = await response.json()
        alert(data.error || 'Booking failed')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ride not found</h1>
          <Button onClick={() => router.push('/rides')}>Back to Search</Button>
        </div>
      </div>
    )
  }

  const departureDate = new Date(ride.departure_time)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {ride.origin_city} → {ride.destination_city}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant={ride.seats_available > 2 ? 'success' : 'warning'}>
                    {ride.seats_available} seats available
                  </Badge>
                  <Badge variant="info">Cash payment only</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-red-600">{ride.price_per_seat} ALL</p>
                <p className="text-sm text-gray-500">per seat</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Departure</p>
                <p className="text-lg font-medium">
                  {departureDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {' at '}
                  {departureDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Pickup Point</p>
                <p className="text-lg font-medium">{ride.pickup_point}</p>
              </div>

              {ride.stops && ride.stops.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stops</p>
                  <p className="text-lg font-medium">{ride.stops.join(', ')}</p>
                </div>
              )}

              <div className="flex gap-4">
                {ride.luggage_space && (
                  <Badge variant="success">Luggage space available</Badge>
                )}
                {ride.smoking_allowed ? (
                  <Badge variant="warning">Smoking allowed</Badge>
                ) : (
                  <Badge variant="success">No smoking</Badge>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-3">Driver</p>
              <div className="flex items-center gap-4">
                {ride.driver.photo_url ? (
                  <img
                    src={ride.driver.photo_url}
                    alt={ride.driver.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-xl">
                      {ride.driver.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-lg font-semibold">{ride.driver.name}</p>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>⭐ {ride.driver.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{ride.driver.total_rides} rides</span>
                    {ride.driver.member_since && (
                      <>
                        <span>•</span>
                        <span>Member since {new Date(ride.driver.member_since).getFullYear()}</span>
                      </>
                    )}
                  </div>
                  {ride.driver.car_model && (
                    <p className="text-sm text-gray-600 mt-1">
                      {ride.driver.car_color} {ride.driver.car_model}
                    </p>
                  )}
                  {ride.driver.bio && (
                    <p className="text-sm text-gray-600 mt-2">{ride.driver.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {ride.seats_available > 0 && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => setBookingModal(true)}
                >
                  Book This Ride
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        title="Book Your Ride"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Seats
            </label>
            <select
              value={seatsCount}
              onChange={(e) => setSeatsCount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[...Array(Math.min(ride.seats_available, 4))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? 'seat' : 'seats'} - {(i + 1) * ride.price_per_seat} ALL
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Message to Driver (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any special requests?"
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Payment:</strong> You will pay {seatsCount * ride.price_per_seat} ALL in cash directly to the driver.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleBooking}
              loading={booking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}