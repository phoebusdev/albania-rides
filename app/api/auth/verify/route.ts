import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyCode } from '@/lib/twilio/client'
import { formatPhoneNumber } from '@/lib/utils/validation'
import { hashPhone } from '@/lib/utils/crypto'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    const formattedPhone = formatPhoneNumber(phone)
    const phoneHash = hashPhone(formattedPhone)

    // Verify OTP
    const isValid = await verifyCode(formattedPhone, otp)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Get user
    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_hash', phoneHash)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update verified status
    await supabase
      .from('users')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', user.id)

    // Create JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
    )

    const token = await new SignJWT({
      sub: user.id,
      phone: formattedPhone,
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    // Return user data (without sensitive fields)
    const userData = {
      id: user.id,
      name: user.name,
      city: user.city,
      photo_url: user.photo_url,
      bio: user.bio,
      is_driver: user.is_driver,
      rating: user.rating,
      total_rides: user.total_rides,
      member_since: user.member_since
    }

    return NextResponse.json({ token, user: userData })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}