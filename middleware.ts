import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/register', '/api/auth/email-login', '/api/rides', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // API routes that require auth
  const protectedApiRoutes = ['/api/bookings', '/api/messages', '/api/ratings', '/api/users/profile']
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Protected pages
  const protectedPages = ['/trips', '/profile', '/rides/new']
  const isProtectedPage = protectedPages.some(route => pathname.startsWith(route))

  // Check authentication for protected routes using Supabase session
  if (isProtectedApiRoute || isProtectedPage) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      } else {
        // Redirect to login for protected pages
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.openweathermap.org"
  )

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)']
}