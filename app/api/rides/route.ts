import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserIdFromRequest } from '@/lib/utils/jwt'
import { getTimePeriod } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const date = searchParams.get('date')
    const timePeriod = searchParams.get('time_period')
    const sort = searchParams.get('sort') || 'departure'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 20)

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    let query = supabase
      .from('rides')
      .select(`
        *,
        driver:users!driver_id(
          id, name, photo_url, rating, total_rides
        )
      `)
      .eq('origin_city', origin)
      .eq('destination_city', destination)
      .eq('status', 'active')
      .gt('departure_time', new Date().toISOString())
      .gt('seats_available', 0)

    // Date filter
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      query = query
        .gte('departure_time', startDate.toISOString())
        .lte('departure_time', endDate.toISOString())
    }

    // Time period filter
    if (timePeriod) {
      // This would need more complex filtering in production
      // For now, we'll handle it client-side
    }

    // Sorting
    if (sort === 'price') {
      query = query.order('price_per_seat', { ascending: true })
    } else if (sort === 'rating') {
      // Would need to join and sort by driver rating
      query = query.order('departure_time', { ascending: true })
    } else {
      query = query.order('departure_time', { ascending: true })
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: rides, error, count } = await query

    if (error) {
      console.error('Failed to fetch rides:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch rides',
          details: error.message,
          code: error.code,
          hint: error.hint,
          debug: {
            origin,
            destination,
            date,
            timePeriod,
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        },
        { status: 500 }
      )
    }

    // Filter by time period if specified
    let filteredRides = rides || []
    if (timePeriod && filteredRides.length > 0) {
      filteredRides = filteredRides.filter(ride => {
        const period = getTimePeriod(new Date(ride.departure_time))
        return period === timePeriod
      })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      rides: filteredRides,
      total: count || 0,
      page,
      pages: totalPages
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      origin_city,
      destination_city,
      departure_time,
      pickup_point,
      seats_total,
      price_per_seat,
      stops,
      luggage_space,
      smoking_allowed,
      is_recurring,
      recurrence_pattern
    } = body

    // Validate
    if (origin_city === destination_city) {
      return NextResponse.json(
        { error: 'Origin and destination must be different' },
        { status: 400 }
      )
    }

    const departureDate = new Date(departure_time)
    if (departureDate <= new Date()) {
      return NextResponse.json(
        { error: 'Departure time must be in the future' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(authHeader)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const driver_id = userId

    const supabase = createClient()
    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        driver_id,
        origin_city,
        destination_city,
        departure_time,
        pickup_point,
        seats_total,
        seats_available: seats_total,
        price_per_seat,
        stops,
        luggage_space: luggage_space || false,
        smoking_allowed: smoking_allowed || false,
        is_recurring: is_recurring || false,
        recurrence_pattern,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create ride:', error)
      return NextResponse.json(
        {
          error: 'Failed to create ride',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json(ride, { status: 201 })
  } catch (error) {
    console.error('Create ride error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create ride',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}