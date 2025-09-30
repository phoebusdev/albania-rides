import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'

// GET /api/users/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone_hash, city, bio, photo_url, is_driver, car_model, car_color, driving_years, rating, total_rides, member_since, verified_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const allowedUpdates = [
      'name',
      'city',
      'bio',
      'photo_url',
      'is_driver',
      'car_model',
      'car_color',
      'driving_years'
    ]

    const updates: any = {}
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Validate
    if (updates.name && (updates.name.length < 2 || updates.name.length > 100)) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      )
    }

    if (updates.bio && updates.bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio cannot exceed 500 characters' },
        { status: 400 }
      )
    }

    if (updates.driving_years && updates.driving_years < 0) {
      return NextResponse.json(
        { error: 'Driving years cannot be negative' },
        { status: 400 }
      )
    }

    // If becoming a driver, require car info
    if (updates.is_driver === true) {
      if (!body.car_model || !body.car_color) {
        return NextResponse.json(
          { error: 'Car model and color are required for drivers' },
          { status: 400 }
        )
      }
    }

    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, name, city, bio, photo_url, is_driver, car_model, car_color, driving_years, rating, total_rides')
      .single()

    if (error) {
      console.error('Failed to update profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}