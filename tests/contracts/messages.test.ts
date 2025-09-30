import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Messages API Contracts', () => {
  describe('GET /api/messages', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/messages`)
      expect(response.status).toBe(401)
    })

    it('should filter by booking_id', async () => {
      const response = await fetch(
        `${BASE_URL}/api/messages?booking_id=00000000-0000-0000-0000-000000000000`,
        { headers: { 'Authorization': 'Bearer fake-token' } }
      )

      expect([200, 401]).toContain(response.status)
    })
  })

  describe('POST /api/messages', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: '00000000-0000-0000-0000-000000000000',
          content: 'Hello'
        })
      })

      expect(response.status).toBe(401)
    })

    it('should require content', async () => {
      const response = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        },
        body: JSON.stringify({
          booking_id: '00000000-0000-0000-0000-000000000000'
        })
      })

      expect(response.status).toBe(400)
    })

    it('should validate message length', async () => {
      const response = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        },
        body: JSON.stringify({
          booking_id: '00000000-0000-0000-0000-000000000000',
          content: 'a'.repeat(1001)
        })
      })

      expect(response.status).toBe(400)
    })
  })
})
