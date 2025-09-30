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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-10 text-gray-900">My Profile</h1>

        <Card className="mb-8 shadow-lift">
          <div className="p-8">
            <div className="flex items-center gap-8 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ring-4 ring-white shadow-lift">
                  <span className="text-white font-bold text-4xl">
                    {formData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success-500 rounded-full border-4 border-white"></div>
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{formData.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-warning-500 font-semibold">⭐ {stats.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700 font-medium">{stats.total_rides} trips completed</span>
                  {stats.member_since && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">Member since {new Date(stats.member_since).getFullYear()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center bg-info-50 rounded-lg py-3">
                <div className="text-2xl font-bold text-info-700">{stats.rating.toFixed(1)}</div>
                <div className="text-xs text-info-600 font-medium">Rating</div>
              </div>
              <div className="text-center bg-success-50 rounded-lg py-3">
                <div className="text-2xl font-bold text-success-700">{stats.total_rides}</div>
                <div className="text-xs text-success-600 font-medium">Trips</div>
              </div>
              <div className="text-center bg-primary-50 rounded-lg py-3">
                <div className="text-2xl font-bold text-primary-700">✓</div>
                <div className="text-xs text-primary-600 font-medium">Verified</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-lift">
          <div className="border-b border-gray-200 px-8 py-4">
            <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
            <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-success-50 border-l-4 border-success-500 text-success-700 px-4 py-3 rounded-r flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>{success}</span>
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

            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-lg p-6 mb-4">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_driver}
                    onChange={(e) => setFormData({ ...formData, is_driver: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                  />
                  <div>
                    <span className="text-base font-semibold text-gray-900 block">
                      🚗 I want to offer rides as a driver
                    </span>
                    <span className="text-sm text-gray-600">
                      Share your trips and earn money by offering rides to passengers
                    </span>
                  </div>
                </label>
              </div>

              {formData.is_driver && (
                <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Driver Information</h4>
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