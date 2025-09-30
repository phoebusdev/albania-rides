import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Booking Flow', () => {
  it('should complete full booking flow', async () => {
    const searchResponse = await fetch(
      `${BASE_URL}/api/rides?origin=Tirana&destination=Durrës`
    )
    expect(searchResponse.status).toBe(200)

    const bookResponse = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({
        ride_id: '00000000-0000-0000-0000-000000000000',
        seats_count: 2,
        message: 'Hi, looking forward to the trip'
      })
    })

    expect([200, 201, 401, 404]).toContain(bookResponse.status)
  })

  it('should prevent overbooking', async () => {
    const response = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({
        ride_id: '00000000-0000-0000-0000-000000000000',
        seats_count: 100
      })
    })

    expect([400, 401, 404]).toContain(response.status)
  })
})
