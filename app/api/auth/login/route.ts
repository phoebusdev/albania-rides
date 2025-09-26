import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendVerificationCode } from '@/lib/twilio/client'
import { validateAlbanianPhone, formatPhoneNumber } from '@/lib/utils/validation'
import { hashPhone } from '@/lib/utils/crypto'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate phone
    const formattedPhone = formatPhoneNumber(phone)
    if (!validateAlbanianPhone(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid Albanian phone number' },
        { status: 400 }
      )
    }

    // Check if user exists
    const supabase = createClient()
    const phoneHash = hashPhone(formattedPhone)

    const { data: user } = await supabase
      .from('users')
      .select('id, suspended_at')
      .eq('phone_hash', phoneHash)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      )
    }

    if (user.suspended_at) {
      return NextResponse.json(
        { error: 'Account suspended. Contact support.' },
        { status: 403 }
      )
    }

    // Send verification code
    await sendVerificationCode(formattedPhone)

    return NextResponse.json({
      message: 'Verification code sent to your phone'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}