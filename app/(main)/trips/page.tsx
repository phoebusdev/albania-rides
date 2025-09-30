'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BookingCard from '@/components/booking/BookingCard'
import Button from '@/components/ui/Button'

export default function TripsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'passenger' | 'driver'>('passenger')
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [activeTab])

  const fetchBookings = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/bookings?role=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('Booking cancelled successfully')
        fetchBookings()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to cancel booking')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'passenger' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('passenger')}
          >
            As Passenger
          </Button>
          <Button
            variant={activeTab === 'driver' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('driver')}
          >
            As Driver
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="animate-pulse space-y-4">
                  <div className="flex gap-4">
                    <div className="skeleton w-16 h-16 rounded-full"></div>
                    <div className="flex-grow space-y-2">
                      <div className="skeleton h-5 w-40 rounded"></div>
                      <div className="skeleton h-4 w-32 rounded"></div>
                    </div>
                  </div>
                  <div className="skeleton h-px w-full"></div>
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full rounded"></div>
                    <div className="skeleton h-4 w-3/4 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
                <span className="text-5xl">
                  {activeTab === 'passenger' ? '🎫' : '🚗'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeTab === 'passenger'
                  ? 'No Bookings Yet'
                  : 'No Posted Rides'}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {activeTab === 'passenger'
                  ? "You haven't booked any rides yet. Start exploring available rides!"
                  : "You haven't posted any rides yet. Share your trip and earn money!"}
              </p>
              <Button
                onClick={() =>
                  router.push(activeTab === 'passenger' ? '/rides' : '/rides/new')
                }
                className="inline-flex items-center gap-2"
              >
                {activeTab === 'passenger' ? '🔍 Find Rides' : '🚗 Post a Ride'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                showDriver={activeTab === 'passenger'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}