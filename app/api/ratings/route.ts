import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'

// GET /api/ratings - Get ratings for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select(`
        *,
        rater:users!rater_id(id, name, photo_url),
        ride:rides(origin_city, destination_city, departure_time)
      `)
      .eq('rated_user_id', userId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Failed to fetch ratings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ratings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ratings })
  } catch (error) {
    console.error('Get ratings error:', error)
    return NextResponse.json(
      { error: 'Failed to get ratings' },
      { status: 500 }
    )
  }
}

// POST /api/ratings - Create a rating
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromRequest(authHeader)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ride_id, rated_user_id, rating, comment } = body

    // Validate
    if (!ride_id || !rated_user_id || !rating) {
      return NextResponse.json(
        { error: 'ride_id, rated_user_id, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (comment && comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment cannot exceed 500 characters' },
        { status: 400 }
      )
    }

    if (rated_user_id === userId) {
      return NextResponse.json(
        { error: 'You cannot rate yourself' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user was part of this ride
    const { data: ride } = await supabase
      .from('rides')
      .select('driver_id')
      .eq('id', ride_id)
      .single()

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      )
    }

    // Check if user was driver or passenger
    const { data: booking } = await supabase
      .from('bookings')
      .select('passenger_id')
      .eq('ride_id', ride_id)
      .eq('passenger_id', userId)
      .single()

    const isDriver = ride.driver_id === userId
    const isPassenger = !!booking

    if (!isDriver && !isPassenger) {
      return NextResponse.json(
        { error: 'You can only rate users from rides you participated in' },
        { status: 403 }
      )
    }

    // Check for duplicate rating
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('ride_id', ride_id)
      .eq('rater_id', userId)
      .eq('rated_user_id', rated_user_id)
      .single()

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this user for this ride' },
        { status: 409 }
      )
    }

    // Check if ride is completed
    const { data: rideData } = await supabase
      .from('rides')
      .select('departure_time, status')
      .eq('id', ride_id)
      .single()

    if (rideData?.status !== 'completed' && new Date(rideData?.departure_time) > new Date()) {
      return NextResponse.json(
        { error: 'You can only rate after the ride is completed' },
        { status: 400 }
      )
    }

    // Create rating
    const { data: newRating, error } = await supabase
      .from('ratings')
      .insert({
        ride_id,
        rater_id: userId,
        rated_user_id,
        rating,
        comment,
        is_visible: false // Will become visible after both parties rate or after 7 days
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create rating:', error)
      return NextResponse.json(
        { error: 'Failed to create rating' },
        { status: 500 }
      )
    }

    // Check if both parties have rated
    const { data: counterRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('ride_id', ride_id)
      .eq('rater_id', rated_user_id)
      .eq('rated_user_id', userId)
      .single()

    if (counterRating) {
      // Both parties rated, make both visible
      await supabase
        .from('ratings')
        .update({ is_visible: true })
        .or(`id.eq.${newRating.id},id.eq.${counterRating.id}`)
    }

    // Update user's average rating
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_user_id', rated_user_id)
      .eq('is_visible', true)

    if (allRatings && allRatings.length > 0) {
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      await supabase
        .from('users')
        .update({ rating: Math.round(avgRating * 10) / 10 })
        .eq('id', rated_user_id)
    }

    return NextResponse.json({ rating: newRating }, { status: 201 })
  } catch (error) {
    console.error('Create rating error:', error)
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    )
  }
}