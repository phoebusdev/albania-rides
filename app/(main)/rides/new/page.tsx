'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import { ALBANIAN_CITIES } from '@/lib/constants/cities'

export default function PostRidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDriver, setIsDriver] = useState(false)

  const [formData, setFormData] = useState({
    origin_city: '',
    destination_city: '',
    departure_time: '',
    pickup_point: '',
    seats_total: 1,
    price_per_seat: '',
    luggage_space: true,
    smoking_allowed: false
  })

  useEffect(() => {
    checkDriverStatus()
  }, [])

  const checkDriverStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.user && data.user.is_driver) {
        setIsDriver(true)
      } else {
        alert('You need to be a driver to post rides. Please update your profile.')
        router.push('/profile')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price_per_seat: Number(formData.price_per_seat)
        })
      })

      if (response.ok) {
        alert('Ride posted successfully!')
        router.push('/trips')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to post ride')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isDriver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const cityOptions = [
    { value: '', label: 'Select city' },
    ...ALBANIAN_CITIES.map(city => ({ value: city.name, label: city.name }))
  ]

  const seatsOptions = [
    { value: '1', label: '1 seat' },
    { value: '2', label: '2 seats' },
    { value: '3', label: '3 seats' },
    { value: '4', label: '4 seats' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Post a New Ride</h1>

        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="From"
                required
                value={formData.origin_city}
                onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                options={cityOptions}
              />
              <Select
                label="To"
                required
                value={formData.destination_city}
                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                options={cityOptions}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Departure Date & Time"
                type="datetime-local"
                required
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
              <Select
                label="Available Seats"
                required
                value={formData.seats_total.toString()}
                onChange={(e) => setFormData({ ...formData, seats_total: Number(e.target.value) })}
                options={seatsOptions}
              />
            </div>

            <Input
              label="Pickup Point"
              required
              value={formData.pickup_point}
              onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
              placeholder="e.g., Skanderbeg Square, near the fountain"
              helperText="Be specific so passengers can find you easily"
            />

            <Input
              label="Price per Seat (ALL)"
              type="number"
              required
              value={formData.price_per_seat}
              onChange={(e) => setFormData({ ...formData, price_per_seat: e.target.value })}
              placeholder="500"
              min="1"
              helperText="Cash payment only"
            />

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.luggage_space}
                  onChange={(e) => setFormData({ ...formData, luggage_space: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Luggage space available
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.smoking_allowed}
                  onChange={(e) => setFormData({ ...formData, smoking_allowed: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Smoking allowed
                </span>
              </label>
            </div>

            <div className="pt-6 flex gap-4">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                loading={loading}
              >
                Post Ride
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}