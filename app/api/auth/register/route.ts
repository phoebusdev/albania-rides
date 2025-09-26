import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendVerificationCode } from '@/lib/twilio/client'
import { validateAlbanianPhone, formatPhoneNumber } from '@/lib/utils/validation'
import { encryptPhone, hashPhone } from '@/lib/utils/crypto'

export async function POST(request: NextRequest) {
  try {
    const { phone, name, city } = await request.json()

    // Validate phone number
    const formattedPhone = formatPhoneNumber(phone)
    if (!validateAlbanianPhone(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid Albanian phone number' },
        { status: 400 }
      )
    }

    // Check if phone already exists
    const supabase = createClient()
    const phoneHash = hashPhone(formattedPhone)

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone_hash', phoneHash)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      )
    }

    // Create user
    const encryptedPhone = encryptPhone(formattedPhone)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        phone_number_encrypted: encryptedPhone,
        phone_hash: phoneHash,
        name,
        city,
        is_driver: false,
        rating: 5.0,
        total_rides: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create user:', error)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Send verification code
    await sendVerificationCode(formattedPhone)

    return NextResponse.json(
      {
        message: 'Verification code sent to your phone',
        verification_required: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}