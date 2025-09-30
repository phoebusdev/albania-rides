import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'

// GET /api/auth/session - Get current session info
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
}

// DELETE /api/auth/session - Logout (client-side token deletion)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'Logged out successfully' })
}