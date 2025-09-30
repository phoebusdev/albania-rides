import { describe, it, expect, beforeAll } from 'vitest'

// Contract test for rides endpoints
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
let authToken: string

describe('Rides API Contracts', () => {
  describe('GET /api/rides', () => {
    it('should return rides list with search parameters', async () => {
      const response = await fetch(
        `${BASE_URL}/api/rides?origin=Tirana&destination=Durrës`,
        { method: 'GET' }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data.rides)).toBe(true)
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('page')
    })

    it('should validate city names', async () => {
      const response = await fetch(
        `${BASE_URL}/api/rides?origin=<script>&destination=Tirana`,
        { method: 'GET' }
      )

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/rides', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_city: 'Tirana',
          destination_city: 'Durrës',
          departure_time: new Date(Date.now() + 86400000).toISOString(),
          seats_total: 3,
          price_per_seat: 500,
          pickup_point: 'Skanderbeg Square'
        })
      })

      expect(response.status).toBe(401)
    })
  })
})
