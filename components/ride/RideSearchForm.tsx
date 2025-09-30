'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { ALBANIAN_CITIES, TIME_PERIODS } from '@/lib/constants/cities'

export default function RideSearchForm() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [timePeriod, setTimePeriod] = useState('')

  const cityOptions = [
    { value: '', label: 'Select city' },
    ...ALBANIAN_CITIES.map(city => ({ value: city.name, label: city.name }))
  ]

  const timePeriodOptions = [
    { value: '', label: 'Any time' },
    ...TIME_PERIODS.map(period => ({ value: period.value, label: `${period.label} (${period.hours})` }))
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!origin || !destination) {
      alert('Please select origin and destination cities')
      return
    }

    const params = new URLSearchParams({
      origin,
      destination,
      ...(date && { date }),
      ...(timePeriod && { time_period: timePeriod })
    })

    router.push(`/rides?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="From"
          required
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          options={cityOptions}
        />
        <Select
          label="To"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          options={cityOptions}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <Select
          label="Time of day"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          options={timePeriodOptions}
        />
      </div>

      <Button type="submit" fullWidth size="lg">
        Search Rides
      </Button>
    </form>
  )
}