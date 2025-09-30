import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'
import { sendSMS } from '@/lib/twilio/client'
import { decryptPhone } from '@/lib/utils/crypto'

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const role = searchParams.get('role') // 'driver' or 'passenger'

    const supabase = createClient()

    if (role === 'driver') {
      // Get bookings for rides I'm driving
      let query = supabase
        .from('bookings')
        .select(`
          *,
          ride:rides!inner(*),
          passenger:users!passenger_id(
            id, name, photo_url, rating, total_rides
          )
        `)
        .eq('ride.driver_id', userId)

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: bookings, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch bookings:', error)
        return NextResponse.json(
          { error: 'Failed to fetch bookings' },
          { status: 500 }
        )
      }

      return NextResponse.json({ bookings })
    } else {
      // Get bookings I made as passenger
      let query = supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(*,
            driver:users!driver_id(
              id, name, photo_url, rating, total_rides, car_model, car_color
            )
          )
        `)
        .eq('passenger_id', userId)

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: bookings, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch bookings:', error)
        return NextResponse.json(
          { error: 'Failed to fetch bookings' },
          { status: 500 }
        )
      }

      return NextResponse.json({ bookings })
    }
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to get bookings' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create booking
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ride_id, seats_count, message } = body

    // Validate
    if (!ride_id || !seats_count) {
      return NextResponse.json(
        { error: 'ride_id and seats_count are required' },
        { status: 400 }
      )
    }

    if (seats_count < 1 || seats_count > 4) {
      return NextResponse.json(
        { error: 'seats_count must be between 1 and 4' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if ride exists and has availability
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*, driver:users!driver_id(*)')
      .eq('id', ride_id)
      .single()

    if (rideError || !ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      )
    }

    if (ride.driver_id === userId) {
      return NextResponse.json(
        { error: 'You cannot book your own ride' },
        { status: 400 }
      )
    }

    if (ride.status !== 'active') {
      return NextResponse.json(
        { error: 'This ride is no longer available' },
        { status: 400 }
      )
    }

    if (ride.seats_available < seats_count) {
      return NextResponse.json(
        { error: 'Not enough seats available' },
        { status: 400 }
      )
    }

    // Check for existing booking
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('ride_id', ride_id)
      .eq('passenger_id', userId)
      .eq('status', 'confirmed')
      .single()

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this ride' },
        { status: 409 }
      )
    }

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        ride_id,
        passenger_id: userId,
        seats_count,
        status: 'confirmed',
        total_price: ride.price_per_seat * seats_count
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create booking:', error)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Update ride seats
    await supabase
      .from('rides')
      .update({
        seats_available: ride.seats_available - seats_count
      })
      .eq('id', ride_id)

    // Get passenger info for SMS
    const { data: passenger } = await supabase
      .from('users')
      .select('name, phone_number_encrypted')
      .eq('id', userId)
      .single()

    // Send SMS notifications
    if (passenger && ride.driver) {
      try {
        const passengerPhone = decryptPhone(passenger.phone_number_encrypted)
        const driverPhone = decryptPhone(ride.driver.phone_number_encrypted)

        await sendSMS(
          driverPhone,
          `New booking! ${passenger.name} booked ${seats_count} seat(s) for your ${ride.origin_city}-${ride.destination_city} ride. Contact: ${passengerPhone}`
        )

        await sendSMS(
          passengerPhone,
          `Booking confirmed! Driver ${ride.driver.name} will pick you up at ${ride.pickup_point}. Contact: ${driverPhone}. Payment: ${ride.price_per_seat * seats_count} ALL cash.`
        )
      } catch (smsError) {
        console.error('Failed to send SMS:', smsError)
        // Don't fail the booking if SMS fails
      }
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}