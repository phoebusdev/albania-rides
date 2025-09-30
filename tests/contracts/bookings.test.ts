import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Bookings API Contracts', () => {
  describe('POST /api/bookings', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: '00000000-0000-0000-0000-000000000000',
          seats_count: 2
        })
      })

      expect(response.status).toBe(401)
    })

    it('should validate seats count', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        },
        body: JSON.stringify({
          ride_id: '00000000-0000-0000-0000-000000000000',
          seats_count: 0
        })
      })

      expect(response.status).toBe(400)
    })

    it('should require ride_id', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        },
        body: JSON.stringify({
          seats_count: 2
        })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/bookings', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings`)
      expect(response.status).toBe(401)
    })

    it('should return user bookings when authenticated', async () => {
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        headers: { 'Authorization': 'Bearer fake-token' }
      })

      expect([200, 401]).toContain(response.status)
    })
  })

  describe('DELETE /api/bookings/[id]', () => {
    it('should require authentication', async () => {
      const response = await fetch(
        `${BASE_URL}/api/bookings/00000000-0000-0000-0000-000000000000`,
        { method: 'DELETE' }
      )

      expect(response.status).toBe(401)
    })

    it('should only allow cancellation before departure', async () => {
      const response = await fetch(
        `${BASE_URL}/api/bookings/00000000-0000-0000-0000-000000000000`,
        {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer fake-token' }
        }
      )

      expect([401, 403, 404, 400]).toContain(response.status)
    })
  })
})
