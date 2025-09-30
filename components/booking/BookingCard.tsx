'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useState } from 'react'

interface BookingCardProps {
  booking: {
    id: string
    seats_count: number
    total_price: number
    status: string
    created_at: string
    ride: {
      id: string
      origin_city: string
      destination_city: string
      departure_time: string
      pickup_point: string
      driver?: {
        name: string
        photo_url?: string
        rating: number
        car_model?: string
        car_color?: string
      }
    }
    passenger?: {
      name: string
      photo_url?: string
      rating: number
    }
  }
  onCancel?: (bookingId: string) => void
  showDriver?: boolean
}

export default function BookingCard({ booking, onCancel, showDriver = true }: BookingCardProps) {
  const [cancelling, setCancelling] = useState(false)
  const departureDate = new Date(booking.ride.departure_time)
  const canCancel = new Date() < new Date(departureDate.getTime() - 2 * 60 * 60 * 1000)

  const statusVariant = {
    confirmed: 'success',
    cancelled: 'error',
    completed: 'neutral'
  }[booking.status] as any

  const handleCancel = async () => {
    if (!onCancel) return
    if (!confirm('Are you sure you want to cancel this booking?')) return

    setCancelling(true)
    try {
      await onCancel(booking.id)
    } finally {
      setCancelling(false)
    }
  }

  const person = showDriver ? booking.ride.driver : booking.passenger

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">
                {booking.ride.origin_city} → {booking.ride.destination_city}
              </h3>
              <Badge variant={statusVariant}>
                {booking.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{booking.ride.pickup_point}</p>
            <p className="text-sm text-gray-600 mt-1">
              {booking.seats_count} {booking.seats_count === 1 ? 'seat' : 'seats'} • {booking.total_price} ALL cash
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-600">
              {departureDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {person && (
          <div className="flex items-center gap-3 pt-3 border-t">
            {person.photo_url ? (
              <img
                src={person.photo_url}
                alt={person.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {person.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium">{person.name}</p>
              <p className="text-sm text-gray-600">⭐ {person.rating.toFixed(1)}</p>
            </div>
            {showDriver && booking.ride.driver?.car_model && (
              <div className="text-right text-sm text-gray-600">
                <p>{booking.ride.driver.car_model}</p>
                <p>{booking.ride.driver.car_color}</p>
              </div>
            )}
          </div>
        )}

        {booking.status === 'confirmed' && canCancel && onCancel && (
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={handleCancel}
              loading={cancelling}
            >
              Cancel Booking
            </Button>
          </div>
        )}

        {booking.status === 'confirmed' && !canCancel && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              Cannot cancel less than 2 hours before departure
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}