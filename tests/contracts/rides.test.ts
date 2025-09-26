import { describe, it, expect, beforeAll } from 'vitest'

describe('Rides API Contract Tests', () => {
  const API_URL = 'http://localhost:3000/api'
  let authToken: string

  beforeAll(async () => {
    // Mock auth token for tests
    authToken = 'test-jwt-token'
  })

  describe('GET /rides', () => {
    it('should search rides with required parameters', async () => {
      const response = await fetch(`${API_URL}/rides?origin=Tirana&destination=Durrës`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('rides')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('page')
      expect(data).toHaveProperty('pages')
      expect(Array.isArray(data.rides)).toBe(true)
    })

    it('should filter by date', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const response = await fetch(
        `${API_URL}/rides?origin=Tirana&destination=Vlorë&date=${tomorrow.toISOString().split('T')[0]}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.rides.every((ride: any) => {
        const rideDate = new Date(ride.departure_time).toDateString()
        return rideDate === tomorrow.toDateString()
      })).toBe(true)
    })

    it('should paginate results', async () => {
      const response = await fetch(
        `${API_URL}/rides?origin=Tirana&destination=Durrës&page=1&limit=10`
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.rides.length).toBeLessThanOrEqual(10)
      expect(data.page).toBe(1)
    })
  })

  describe('POST /rides', () => {
    it('should create ride when authenticated', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)

      const response = await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          origin_city: 'Tirana',
          destination_city: 'Durrës',
          departure_time: tomorrow.toISOString(),
          pickup_point: 'Skanderbeg Square',
          seats_total: 3,
          price_per_seat: 500,
          luggage_space: true,
          smoking_allowed: false
        })
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data.origin_city).toBe('Tirana')
      expect(data.destination_city).toBe('Durrës')
      expect(data.seats_available).toBe(3)
    })

    it('should reject ride without authentication', async () => {
      const response = await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_city: 'Tirana',
          destination_city: 'Durrës',
          departure_time: new Date().toISOString(),
          pickup_point: 'Test',
          seats_total: 3,
          price_per_seat: 500
        })
      })

      expect(response.status).toBe(401)
    })

    it('should reject same origin and destination', async () => {
      const response = await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          origin_city: 'Tirana',
          destination_city: 'Tirana',
          departure_time: new Date().toISOString(),
          pickup_point: 'Test',
          seats_total: 3,
          price_per_seat: 500
        })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /rides/:id', () => {
    it('should return ride details', async () => {
      const rideId = 'test-ride-uuid'
      const response = await fetch(`${API_URL}/rides/${rideId}`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('driver')
      expect(data).toHaveProperty('origin_city')
      expect(data).toHaveProperty('destination_city')
      expect(data).toHaveProperty('departure_time')
      expect(data).toHaveProperty('price_per_seat')
    })

    it('should return 404 for non-existent ride', async () => {
      const response = await fetch(`${API_URL}/rides/non-existent-id`)
      expect(response.status).toBe(404)
    })
  })

  describe('PUT /rides/:id', () => {
    it('should update ride when owner', async () => {
      const rideId = 'test-ride-uuid'
      const response = await fetch(`${API_URL}/rides/${rideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          seats_available: 2
        })
      })

      expect(response.status).toBe(200)
    })

    it('should reject update from non-owner', async () => {
      const rideId = 'other-user-ride'
      const response = await fetch(`${API_URL}/rides/${rideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          seats_available: 2
        })
      })

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /rides/:id', () => {
    it('should cancel ride when owner', async () => {
      const rideId = 'test-ride-uuid'
      const response = await fetch(`${API_URL}/rides/${rideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(204)
    })
  })
})