'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import { ALBANIAN_CITIES } from '@/lib/constants/cities'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    bio: '',
    is_driver: false,
    car_model: '',
    car_color: '',
    driving_years: ''
  })

  const [stats, setStats] = useState({
    rating: 5.0,
    total_rides: 0,
    member_since: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.user) {
        setFormData({
          name: data.user.name,
          city: data.user.city,
          bio: data.user.bio || '',
          is_driver: data.user.is_driver,
          car_model: data.user.car_model || '',
          car_color: data.user.car_color || '',
          driving_years: data.user.driving_years?.toString() || ''
        })
        setStats({
          rating: data.user.rating,
          total_rides: data.user.total_rides,
          member_since: data.user.member_since
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          driving_years: formData.driving_years ? Number(formData.driving_years) : undefined
        })
      })

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-semibold text-3xl">
                  {formData.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{formData.name}</h2>
                <div className="flex items-center gap-4 text-gray-600 mt-1">
                  <span>⭐ {stats.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{stats.total_rides} rides</span>
                  {stats.member_since && (
                    <>
                      <span>•</span>
                      <span>Member since {new Date(stats.member_since).getFullYear()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Select
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              options={cityOptions}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Tell others about yourself..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="border-t pt-6">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.is_driver}
                  onChange={(e) => setFormData({ ...formData, is_driver: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  I want to offer rides as a driver
                </span>
              </label>

              {formData.is_driver && (
                <div className="space-y-4 pl-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Car Model"
                      required
                      value={formData.car_model}
                      onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                      placeholder="e.g., Toyota Corolla"
                    />
                    <Input
                      label="Car Color"
                      required
                      value={formData.car_color}
                      onChange={(e) => setFormData({ ...formData, car_color: e.target.value })}
                      placeholder="e.g., Silver"
                    />
                  </div>
                  <Input
                    label="Years of Driving Experience"
                    type="number"
                    value={formData.driving_years}
                    onChange={(e) => setFormData({ ...formData, driving_years: e.target.value })}
                    min="0"
                    placeholder="0"
                  />
                </div>
              )}
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
                loading={saving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}