import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, name, city } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // For new users (registration), create profile data
    if (name && city) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered. Please login instead.' },
          { status: 409 }
        )
      }

      // Send magic link with metadata
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
          data: {
            name,
            city,
            auth_method: 'email'
          }
        }
      })

      if (error) {
        console.error('Failed to send magic link:', error)
        return NextResponse.json(
          {
            error: 'Failed to send verification email',
            details: error.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Check your email for the magic link to complete registration',
        email
      })
    } else {
      // Existing user login - just send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
        }
      })

      if (error) {
        console.error('Failed to send magic link:', error)
        return NextResponse.json(
          {
            error: 'Failed to send login email',
            details: error.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Check your email for the magic link to login',
        email
      })
    }
  } catch (error) {
    console.error('Email auth error:', error)
    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}