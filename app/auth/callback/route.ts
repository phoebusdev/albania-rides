import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/trips'

  if (code) {
    const supabase = createClient()

    // Exchange code for session
    const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Failed to exchange code:', sessionError)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    if (user) {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      // Create profile if it doesn't exist
      if (!profile) {
        const metadata = user.user_metadata || {}

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: metadata.name || user.email?.split('@')[0] || 'User',
            city: metadata.city || 'TIA',
            photo_url: metadata.avatar_url || null,
            auth_method: metadata.auth_method || 'email',
            auth_provider: user.app_metadata.provider || 'email',
            auth_provider_id: user.id,
            is_driver: false,
            rating: 5.0,
            total_rides: 0
          })

        if (insertError) {
          console.error('Failed to create user profile:', insertError)
          // Don't fail the login, profile can be created later
        }
      }

      // Successful login
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // No code provided or error occurred
  return NextResponse.redirect(new URL('/login?error=no_code', request.url))
}