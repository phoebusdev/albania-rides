import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'

// GET /api/rides/[id] - Get ride details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid ride ID format' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data: ride, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:users!driver_id(
          id, name, photo_url, city, bio,
          car_model, car_color, driving_years,
          rating, total_rides, member_since
        )
      `)
      .eq('id', id)
      .single()

    if (error || !ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ride })
  } catch (error) {
    console.error('Get ride error:', error)
    return NextResponse.json(
      { error: 'Failed to get ride' },
      { status: 500 }
    )
  }
}

// PUT /api/rides/[id] - Update ride
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    // Check if ride belongs to user
    const { data: existingRide, error: fetchError } = await supabase
      .from('rides')
      .select('driver_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingRide) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      )
    }

    if (existingRide.driver_id !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own rides' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const allowedUpdates = [
      'departure_time',
      'pickup_point',
      'seats_total',
      'price_per_seat',
      'stops',
      'luggage_space',
      'smoking_allowed'
    ]

    const updates: any = {}
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // If seats_total is updated, adjust seats_available
    if (updates.seats_total !== undefined) {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('seats_count')
        .eq('ride_id', id)
        .eq('status', 'confirmed')

      const bookedSeats = bookings?.reduce((sum, b) => sum + b.seats_count, 0) || 0
      updates.seats_available = updates.seats_total - bookedSeats

      if (updates.seats_available < 0) {
        return NextResponse.json(
          { error: 'Cannot reduce seats below booked amount' },
          { status: 400 }
        )
      }
    }

    const { data: ride, error } = await supabase
      .from('rides')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update ride:', error)
      return NextResponse.json(
        { error: 'Failed to update ride' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ride })
  } catch (error) {
    console.error('Update ride error:', error)
    return NextResponse.json(
      { error: 'Failed to update ride' },
      { status: 500 }
    )
  }
}

// DELETE /api/rides/[id] - Cancel ride
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    // Check if ride belongs to user
    const { data: existingRide, error: fetchError } = await supabase
      .from('rides')
      .select('driver_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingRide) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      )
    }

    if (existingRide.driver_id !== userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own rides' },
        { status: 403 }
      )
    }

    // Cancel the ride and all bookings
    await supabase
      .from('rides')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', id)

    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('ride_id', id)
      .eq('status', 'confirmed')

    // TODO: Send SMS notifications to all passengers

    return NextResponse.json({ message: 'Ride cancelled successfully' })
  } catch (error) {
    console.error('Delete ride error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel ride' },
      { status: 500 }
    )
  }
}