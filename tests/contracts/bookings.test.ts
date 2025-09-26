import { describe, it, expect, beforeAll } from 'vitest'

describe('Bookings API Contract Tests', () => {
  const API_URL = 'http://localhost:3000/api'
  let authToken: string

  beforeAll(async () => {
    authToken = 'test-jwt-token'
  })

  describe('GET /bookings', () => {
    it('should return user bookings when authenticated', async () => {
      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should filter bookings by role', async () => {
      const response = await fetch(`${API_URL}/bookings?role=passenger`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should filter by status', async () => {
      const response = await fetch(`${API_URL}/bookings?status=upcoming`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.every((booking: any) =>
        new Date(booking.ride.departure_time) > new Date()
      )).toBe(true)
    })

    it('should reject without authentication', async () => {
      const response = await fetch(`${API_URL}/bookings`)
      expect(response.status).toBe(401)
    })
  })

  describe('POST /bookings', () => {
    it('should create booking with valid data', async () => {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ride_id: 'test-ride-uuid',
          seats_booked: 2,
          passenger_message: 'I have one suitcase'
        })
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('ride_id')
      expect(data).toHaveProperty('seats_booked', 2)
      expect(data).toHaveProperty('status', 'confirmed')
    })

    it('should reject booking more seats than available', async () => {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ride_id: 'ride-with-1-seat',
          seats_booked: 3
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should prevent double booking same ride', async () => {
      const rideId = 'test-ride-uuid'

      // First booking
      await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ride_id: rideId,
          seats_booked: 1
        })
      })

      // Second booking attempt
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ride_id: rideId,
          seats_booked: 1
        })
      })

      expect(response.status).toBe(409)
    })
  })

  describe('DELETE /bookings/:id', () => {
    it('should cancel booking more than 2 hours before', async () => {
      const bookingId = 'future-booking-id'
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(204)
    })

    it('should reject cancellation within 2 hours', async () => {
      const bookingId = 'soon-booking-id'
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should return 404 for non-existent booking', async () => {
      const response = await fetch(`${API_URL}/bookings/non-existent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(404)
    })
  })
})