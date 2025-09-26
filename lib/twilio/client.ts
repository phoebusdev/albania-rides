import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendVerificationCode(phone: string): Promise<void> {
  if (!client || !verifyServiceSid) {
    console.log('[TEST MODE] Sending verification to:', phone)
    return
  }

  try {
    await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({ to: phone, channel: 'sms' })
  } catch (error) {
    console.error('Failed to send verification:', error)
    throw new Error('Failed to send verification code')
  }
}

export async function verifyCode(phone: string, code: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    console.log('[TEST MODE] Verifying:', phone, 'with code:', code)
    return code === '123456' // Test mode accepts this code
  }

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks
      .create({ to: phone, code })

    return verification.status === 'approved'
  } catch (error) {
    console.error('Failed to verify code:', error)
    return false
  }
}

export async function sendSMS(to: string, body: string): Promise<void> {
  if (!client) {
    console.log('[TEST MODE] SMS to:', to, 'Body:', body)
    return
  }

  try {
    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body
    })
  } catch (error) {
    console.error('Failed to send SMS:', error)
  }
}