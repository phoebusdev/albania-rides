'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useRouter } from 'next/navigation'

interface RideCardProps {
  ride: {
    id: string
    origin_city: string
    destination_city: string
    departure_time: string
    seats_available: number
    price_per_seat: number
    pickup_point: string
    driver: {
      id: string
      name: string
      photo_url?: string
      rating: number
      total_rides: number
    }
  }
}

export default function RideCard({ ride }: RideCardProps) {
  const router = useRouter()
  const departureDate = new Date(ride.departure_time)

  return (
    <Card clickable onClick={() => router.push(`/rides/${ride.id}`)}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">
                {ride.origin_city} → {ride.destination_city}
              </h3>
              <Badge variant={ride.seats_available > 2 ? 'success' : 'warning'}>
                {ride.seats_available} {ride.seats_available === 1 ? 'seat' : 'seats'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{ride.pickup_point}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">{ride.price_per_seat} ALL</p>
            <p className="text-xs text-gray-500">per seat</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3">
            {ride.driver.photo_url ? (
              <img
                src={ride.driver.photo_url}
                alt={ride.driver.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {ride.driver.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">{ride.driver.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>⭐ {ride.driver.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{ride.driver.total_rides} rides</span>
              </div>
            </div>
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

        <div className="mt-3 pt-3 border-t">
          <Badge variant="info" size="sm">Cash payment only</Badge>
        </div>
      </div>
    </Card>
  )
}