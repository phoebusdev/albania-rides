import { describe, it, expect } from 'vitest'

describe('Auth API Contract Tests', () => {
  const API_URL = 'http://localhost:3000/api'

  describe('POST /auth/register', () => {
    it('should register new user with valid Albanian phone', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+355691234567',
          name: 'Test User',
          city: 'Tirana'
        })
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('verification_required', true)
    })

    it('should reject non-Albanian phone numbers', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+1234567890',
          name: 'Test User',
          city: 'Tirana'
        })
      })

      expect(response.status).toBe(400)
    })

    it('should return 409 for already registered phone', async () => {
      const phone = '+355691234568'

      // First registration
      await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: 'User 1', city: 'Tirana' })
      })

      // Duplicate registration
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: 'User 2', city: 'Durrës' })
      })

      expect(response.status).toBe(409)
    })
  })

  describe('POST /auth/verify', () => {
    it('should verify phone with correct OTP', async () => {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+355691234567',
          otp: '123456'
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('token')
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('id')
      expect(data.user).toHaveProperty('name')
    })

    it('should reject invalid OTP', async () => {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+355691234567',
          otp: '000000'
        })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    it('should send OTP for registered user', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+355691234567'
        })
      })

      expect(response.status).toBe(200)
    })

    it('should return 404 for unregistered phone', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+355699999999'
        })
      })

      expect(response.status).toBe(404)
    })
  })
})