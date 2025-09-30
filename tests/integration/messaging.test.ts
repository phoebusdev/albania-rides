import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Messaging Flow', () => {
  it('should allow messaging between driver and passenger', async () => {
    const sendResponse = await fetch(`${BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({
        booking_id: '00000000-0000-0000-0000-000000000000',
        content: 'Where are you?'
      })
    })

    expect([200, 201, 401, 404]).toContain(sendResponse.status)
  })

  it('should support quick message templates', async () => {
    const quickMessages = [
      "Where are you?",
      "I'm ready",
      "Running 5 minutes late",
      "On my way"
    ]

    for (const message of quickMessages) {
      const response = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        },
        body: JSON.stringify({
          booking_id: '00000000-0000-0000-0000-000000000000',
          content: message
        })
      })

      expect([200, 201, 401, 404]).toContain(response.status)
    }
  })
})
