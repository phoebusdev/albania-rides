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
- `npm run db:seed` - Seed database with test data (50 users, 100 rides, 147 bookings, 200 messages, 120 ratings)
  - Requires `.env.local` with Supabase credentials
  - Pull from Vercel: `vercel env pull .env.local`
  - Run: `set -a && source .env.local && set +a && npm run db:seed`
  - See `SEED_INSTRUCTIONS.md` for detailed guide

## Architecture

This is a Next.js 14 ridesharing application for Albania using the App Router architecture.

### Key Technologies
- **Next.js 14** with App Router and React Server Components
- **TypeScript 5.3** - Strict type checking enabled
- **Supabase** - PostgreSQL database, authentication (email magic links), and real-time subscriptions
- **Tailwind CSS 3** - Utility-first styling
- **Vercel** - Deployment platform with automatic deployments from GitHub
- **PWA** - Progressive Web App with offline support (optional, via next-pwa)

### Directory Structure

```
app/
├── (auth)/          # Auth route group - register, login (email magic link)
├── (main)/          # Main app routes - rides, trips (protected)
├── (static)/        # Static pages - FAQ, safety
├── api/             # API routes for rides, auth, bookings, messages, ratings
├── auth/callback/   # Magic link callback handler
├── layout.tsx       # Root layout with metadata and PWA config
└── page.tsx         # Landing page

lib/
├── supabase/        # Supabase client factories (server.ts, client.ts)
├── utils/           # Validation, crypto utilities
└── constants/       # Cities (15), popular routes, time periods

scripts/
└── seed.js          # Database seeding script (creates test data)

supabase/migrations/ # Database schema migrations (001-004)

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
- **users** - Email-authenticated users (email, name, city, is_driver, car details, rating)
- **rides** - Posted ride offers with origin, destination, departure time, seats, price
- **bookings** - Ride reservations linking users to rides (confirmed/cancelled status)
- **messages** - In-app communication between drivers and passengers
- **ratings** - 1-5 star reviews with optional comments (mutual driver/passenger ratings)

Albanian cities are defined in `lib/constants/cities.ts` with coordinates for 15 major cities:
- Major: Tirana, Durrës, Vlorë, Shkodër, Elbasan, Fier, Korçë, Berat
- Others: Lushnjë, Kavajë, Pogradec, Gjirokastër, Sarandë, Laç, Kukës

**Migrations**:
- 001: Initial schema (users, rides, bookings, messages, ratings)
- 002: RLS policies for data access control
- 003: Performance indexes
- 004: Email auth support (adds email, auth_method columns)

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (https://xxx.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for seed script and server admin ops)
- `NEXT_PUBLIC_APP_URL` - Base URL for the app (needed for auth callback URLs)

Optional:
- `WEATHER_API_KEY` - OpenWeatherMap API for weather conditions

**Get from Vercel**: `vercel env pull .env.local`

**Legacy** (no longer required):
- `TWILIO_*` - SMS verification (replaced by Supabase email auth)
- `PHONE_ENCRYPTION_KEY` - Phone encryption (replaced by email auth)

## Development Workflow

### Initial Setup
1. Clone repository
2. `npm install` - Install dependencies
3. `vercel env pull .env.local` - Get environment variables from Vercel
4. Run migration 004 in Supabase SQL Editor (see `EMAIL_AUTH_STATUS.md`)
5. Enable email provider in Supabase dashboard
6. Configure redirect URLs in Supabase dashboard

### Local Development
1. `npm run dev` - Start development server
2. Visit http://localhost:3000
3. Use seed data or create test accounts at `/register`

### Testing with Data
1. `set -a && source .env.local && set +a && npm run db:seed`
2. Creates 50 users, 100 rides, 147 bookings, 200 messages, 120 ratings
3. All test emails use `@albaniarides.test` domain

### Deployment
1. Push to GitHub main branch
2. Vercel auto-deploys
3. Or: `vercel --prod` for manual deployment
4. Current URL: https://albania-rides-hffyslid0-phoebusdevs-projects.vercel.app

## Important Notes

- **Route groups**: Uses Next.js route groups `(auth)`, `(main)`, `(static)` for organization without affecting URLs
- **PWA config**: Optional PWA setup in `next.config.js` - falls back gracefully if `next-pwa` is not installed
- **Cash-only**: This is a cash-based ridesharing platform (no payment processing)
- **Albanian market**: UI should support Albanian language (`nameSq` fields) and local conventions
- **Security headers**: CSP and security headers are enforced in middleware for all routes
- **Auth callback**: Magic link redirects go through `/auth/callback` which exchanges code for session and creates user profile
- **Test data**: All seeded data uses `@albaniarides.test` emails - safe to delete anytime

## Documentation

- `EMAIL_AUTH_STATUS.md` - Email authentication deployment status and setup
- `EMAIL_AUTH_SETUP_INSTRUCTIONS.md` - Step-by-step Supabase configuration
- `SEED_INSTRUCTIONS.md` - Database seeding guide
- `AUTH_MIGRATION_PLAN.md` - Migration strategy from SMS to email auth