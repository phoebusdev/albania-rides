import { describe, it, expect, beforeAll } from 'vitest'

// Integration test for phone verification flow
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_PHONE = '+355691234567'

describe('Phone Verification Flow', () => {
  it('should complete full registration and verification flow', async () => {
    // Step 1: Register with phone number
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: TEST_PHONE,
        name: 'Test User',
        city: 'Tirana'
      })
    })

    expect(registerResponse.status).toBe(200)
    const registerData = await registerResponse.json()
    expect(registerData.success).toBe(true)

    // Step 2: Verify with code (will use test code in dev)
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: TEST_PHONE,
        code: '123456'
      })
    })

    if (process.env.NODE_ENV === 'test') {
      expect(verifyResponse.status).toBe(200)
      const verifyData = await verifyResponse.json()
      expect(verifyData).toHaveProperty('token')
      expect(verifyData).toHaveProperty('user')
    }
  })

  it('should handle re-login for existing users', async () => {
    // Attempt login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: TEST_PHONE
      })
    })

    expect([200, 404]).toContain(loginResponse.status)
  })

  it('should reject unverified users from protected actions', async () => {
    // Try to create ride without verification
    const rideResponse = await fetch(`${BASE_URL}/api/rides`, {
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

    expect(rideResponse.status).toBe(401)
  })
})
