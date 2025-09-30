# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Next.js development server on http://localhost:3000
- `npm run build` - Build production bundle (runs Next.js build)
- `npm start` - Start production server
- `npm run lint` - Run ESLint with Next.js config

### Testing
- `npm test` - Run Vitest unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- Test files are organized in `tests/unit/`, `tests/integration/`, and `tests/contracts/`

### Database
- `npm run db:migrate` - Run Supabase migrations from `supabase/migrations/`
- `npm run db:seed` - Seed database with initial data using `supabase/seed.sql`

## Architecture

This is a Next.js 14 ridesharing application for Albania using the App Router architecture.

### Key Technologies
- **Next.js 14** with App Router and React Server Components
- **TypeScript 5.3** - Strict type checking enabled
- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Twilio** - SMS verification and messaging
- **Tailwind CSS 3** - Utility-first styling
- **PWA** - Progressive Web App with offline support (optional)

### Directory Structure

```
app/
├── (auth)/          # Auth route group - register, verify, login
├── (main)/          # Main app routes - rides, trips (protected)
├── (static)/        # Static pages - FAQ, terms, etc.
├── api/             # API routes for rides, auth, bookings
├── layout.tsx       # Root layout with metadata and PWA config
└── page.tsx         # Landing page

lib/
├── supabase/        # Supabase client factories (server.ts, client.ts)
├── twilio/          # Twilio SMS client wrapper
├── utils/           # Validation, crypto utilities
└── constants/       # Cities, routes, time periods

middleware.ts        # Auth checks, security headers, CSP
```

### Authentication & Security

- **Email magic link auth**: Uses Supabase email authentication (no passwords, no SMS costs)
- **Auth flow**: User enters email → receives magic link → clicks to login → auto-creates profile
- **Middleware**: Protects routes and API endpoints using `supabase.auth.getUser()`, enforces CSP headers (middleware.ts:5-47)
- **Server vs Client Supabase**:
  - Use `lib/supabase/server.ts` in Server Components and API routes
  - Use `lib/supabase/client.ts` in Client Components
  - Both handle SSR cookie management via `@supabase/ssr`
- **Legacy**: Phone encryption utilities remain in `lib/utils/crypto.ts` for optional phone contact field

### Data Model

Key entities:
- **users** - Email-authenticated users (email, name, city, optional phone)
- **rides** - Posted ride offers with origin, destination, time, seats
- **bookings** - Ride reservations linking users to rides
- **messages** - In-app communication between drivers and passengers

Albanian cities are defined in `lib/constants/cities.ts` with coordinates for 15 major cities.

**Note**: Migration 004 adds email auth support. Users can have `auth_method: 'email'` or legacy phone auth.

### Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase connection
- `SUPABASE_SERVICE_KEY` - For server-side admin operations
- `NEXT_PUBLIC_APP_URL` - Base URL for the app (needed for auth callback URLs)
- `WEATHER_API_KEY` - OpenWeatherMap API for weather conditions (optional)

**Legacy** (no longer required for email auth):
- `TWILIO_*` - SMS verification (replaced by Supabase email auth)
- `PHONE_ENCRYPTION_KEY` - For encrypting phone numbers (only if adding optional phone field)

## Development Notes

- **Route groups**: Uses Next.js route groups `(auth)`, `(main)`, `(static)` for organization without affecting URLs
- **PWA config**: Optional PWA setup in `next.config.js` - falls back gracefully if `next-pwa` is not installed
- **Cash-only**: This is a cash-based ridesharing platform (no payment processing)
- **Albanian market**: UI should support Albanian language (`nameSq` fields) and local conventions
- **Security headers**: CSP and security headers are enforced in middleware for all routes
- **Auth callback**: Magic link redirects go through `/auth/callback` which exchanges code for session and creates user profile
- **Supabase setup**: Email auth provider must be enabled in Supabase dashboard (see `EMAIL_AUTH_SETUP_INSTRUCTIONS.md`)