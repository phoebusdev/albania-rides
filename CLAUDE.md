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

- **Phone-only auth**: Uses Twilio SMS verification (no passwords)
- **Encrypted phone numbers**: Phone numbers are encrypted at rest using AES-256-GCM (see `lib/utils/crypto.ts`)
- **Middleware**: Protects routes and API endpoints, enforces CSP headers (middleware.ts:5-43)
- **Server vs Client Supabase**:
  - Use `lib/supabase/server.ts` in Server Components and API routes
  - Use `lib/supabase/client.ts` in Client Components
  - Both handle SSR cookie management via `@supabase/ssr`

### Data Model

Key entities:
- **users** - Phone-authenticated users with encrypted phone numbers
- **rides** - Posted ride offers with origin, destination, time, seats
- **bookings** - Ride reservations linking users to rides
- **messages** - In-app communication between drivers and passengers

Albanian cities are defined in `lib/constants/cities.ts` with coordinates for 15 major cities.

### Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase connection
- `SUPABASE_SERVICE_KEY` - For server-side admin operations
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_VERIFY_SERVICE_SID` - SMS verification
- `PHONE_ENCRYPTION_KEY` - 32-byte hex key for encrypting phone numbers (generate with `openssl rand -hex 32`)
- `WEATHER_API_KEY` - OpenWeatherMap API for weather conditions
- `NEXT_PUBLIC_APP_URL` - Base URL for the app

## Development Notes

- **Route groups**: Uses Next.js route groups `(auth)`, `(main)`, `(static)` for organization without affecting URLs
- **PWA config**: Optional PWA setup in `next.config.js` - falls back gracefully if `next-pwa` is not installed
- **Cash-only**: This is a cash-based ridesharing platform (no payment processing)
- **Albanian market**: UI should support Albanian language (`nameSq` fields) and local conventions
- **Security headers**: CSP and security headers are enforced in middleware for all routes