import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'

// GET /api/messages - Get messages for a booking
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('booking_id')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user is part of this booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('passenger_id, ride:rides!inner(driver_id)')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const isAuthorized =
      booking.passenger_id === userId ||
      booking.ride.driver_id === userId

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You can only view messages for your own bookings' },
        { status: 403 }
      )
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, photo_url)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { booking_id, content } = body

    // Validate
    if (!booking_id || !content) {
      return NextResponse.json(
        { error: 'booking_id and content are required' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Message content cannot exceed 1000 characters' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user is part of this booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('passenger_id, ride:rides!inner(driver_id)')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const isPassenger = booking.passenger_id === userId
    const isDriver = booking.ride.driver_id === userId

    if (!isPassenger && !isDriver) {
      return NextResponse.json(
        { error: 'You can only send messages for your own bookings' },
        { status: 403 }
      )
    }

    // Determine receiver
    const receiver_id = isPassenger ? booking.ride.driver_id : booking.passenger_id

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        booking_id,
        sender_id: userId,
        receiver_id,
        content
      })
      .select(`
        *,
        sender:users!sender_id(id, name, photo_url)
      `)
      .single()

    if (error) {
      console.error('Failed to create message:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}