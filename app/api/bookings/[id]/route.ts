import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'
import { sendSMS } from '@/lib/twilio/client'
import { decryptPhone } from '@/lib/utils/crypto'

// DELETE /api/bookings/[id] - Cancel booking
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

    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        ride:rides(*,
          driver:users!driver_id(*)
        ),
        passenger:users!passenger_id(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (booking.passenger_id !== userId && booking.ride.driver_id !== userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own bookings' },
        { status: 403 }
      )
    }

    // Check if ride hasn't departed yet
    const departureTime = new Date(booking.ride.departure_time)
    const twoHoursBeforeDeparture = new Date(departureTime.getTime() - 2 * 60 * 60 * 1000)

    if (new Date() > twoHoursBeforeDeparture) {
      return NextResponse.json(
        { error: 'Cannot cancel less than 2 hours before departure' },
        { status: 400 }
      )
    }

    // Cancel booking
    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', id)

    // Return seats to ride
    await supabase
      .from('rides')
      .update({
        seats_available: booking.ride.seats_available + booking.seats_count
      })
      .eq('id', booking.ride_id)

    // Send SMS notifications
    try {
      const passengerPhone = decryptPhone(booking.passenger.phone_number_encrypted)
      const driverPhone = decryptPhone(booking.ride.driver.phone_number_encrypted)

      if (booking.passenger_id === userId) {
        // Passenger cancelled
        await sendSMS(
          driverPhone,
          `Booking cancelled: ${booking.passenger.name} cancelled ${booking.seats_count} seat(s) for ${booking.ride.origin_city}-${booking.ride.destination_city} ride.`
        )
        await sendSMS(
          passengerPhone,
          `Your booking for ${booking.ride.origin_city}-${booking.ride.destination_city} has been cancelled.`
        )
      } else {
        // Driver cancelled
        await sendSMS(
          passengerPhone,
          `Ride cancelled: Driver ${booking.ride.driver.name} cancelled the ${booking.ride.origin_city}-${booking.ride.destination_city} ride. Please find another ride.`
        )
      }
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError)
    }

    return NextResponse.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}