# AlbaniaRides - Project Summary

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Deployment**: https://albania-rides-hffyslid0-phoebusdevs-projects.vercel.app
**Last Updated**: September 30, 2025

---

## Overview

AlbaniaRides is a modern, cash-based ridesharing platform for Albania built with Next.js 14, Supabase, and deployed on Vercel. The platform connects drivers and passengers across 15 major Albanian cities with a focus on simplicity, security, and zero transaction fees.

### Key Features

✅ **Email Magic Link Authentication** - No passwords, no SMS costs
✅ **Real-time Ride Search** - Filter by city, date, time, seats
✅ **Booking System** - Confirm, cancel, manage ride reservations
✅ **In-app Messaging** - Direct communication between drivers and passengers
✅ **Mutual Ratings** - 5-star review system for trust building
✅ **Multi-city Support** - 15 Albanian cities with realistic routes and pricing
✅ **Cash-only Payments** - No payment processing, no transaction fees
✅ **PWA Ready** - Progressive Web App for offline support

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.3 (strict mode)
- **Styling**: Tailwind CSS 3
- **UI**: React Server Components + Client Components
- **PWA**: next-pwa for offline support

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email magic links)
- **Real-time**: Supabase subscriptions
- **API**: Next.js API routes

### Infrastructure
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Database Host**: Supabase Cloud
- **Domain**: albania-rides.vercel.app
- **CI/CD**: Automatic deployments on push to main

---

## Project Structure

```
albania-rides/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── register/        # Email registration with name + city
│   │   └── login/           # Email login (magic link)
│   ├── (main)/              # Protected routes
│   │   ├── rides/           # Browse and search rides
│   │   ├── trips/           # User's bookings
│   │   └── profile/         # User profile
│   ├── (static)/            # Public pages
│   │   ├── faq/
│   │   └── safety/
│   ├── api/                 # API routes
│   │   ├── auth/            # Email auth endpoint
│   │   ├── rides/           # CRUD for rides
│   │   ├── bookings/        # Booking management
│   │   ├── messages/        # Messaging
│   │   └── ratings/         # Reviews
│   ├── auth/callback/       # Magic link handler
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── lib/
│   ├── supabase/            # Database clients
│   │   ├── server.ts        # Server-side client
│   │   └── client.ts        # Client-side client
│   ├── utils/               # Utilities
│   │   ├── validation.ts
│   │   └── crypto.ts        # Legacy phone encryption
│   └── constants/
│       └── cities.ts        # Albanian cities and routes
├── scripts/
│   └── seed.js              # Database seeding (test data)
├── supabase/
│   └── migrations/          # Database schema
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_indexes.sql
│       └── 004_add_email_auth_v2.sql
├── middleware.ts            # Auth + security headers
└── next.config.js           # Next.js config with PWA

Documentation:
├── CLAUDE.md                        # Developer guide
├── EMAIL_AUTH_STATUS.md             # Auth deployment status
├── EMAIL_AUTH_SETUP_INSTRUCTIONS.md # Supabase setup
├── SEED_INSTRUCTIONS.md             # Database seeding
└── PROJECT_SUMMARY.md               # This file
```

---

## Database Schema

### Tables

#### users
- **Purpose**: User profiles for drivers and passengers
- **Key Fields**: email, name, city, is_driver, car_model, car_color, rating
- **Auth**: Email-based via Supabase Auth
- **Indexes**: email (unique), auth_provider

#### rides
- **Purpose**: Posted ride offers
- **Key Fields**: driver_id, origin_city, destination_city, departure_time, seats_total, seats_available, price_per_seat
- **Status**: active, completed, cancelled
- **Features**: luggage_space, smoking_allowed, recurring rides

#### bookings
- **Purpose**: Ride reservations
- **Key Fields**: ride_id, passenger_id, seats_booked, total_price, status
- **Status**: confirmed, cancelled, completed
- **Constraints**: unique (passenger, ride) - no duplicate bookings

#### messages
- **Purpose**: Driver-passenger communication
- **Key Fields**: booking_id, sender_id, receiver_id, content, read_at
- **Features**: Quick messages, read receipts

#### ratings
- **Purpose**: Reviews after completed rides
- **Key Fields**: ride_id, rater_id, rated_id, rater_type, stars (1-5), comment
- **Visibility**: All ratings public after ride completion

### Migrations

1. **001_initial_schema.sql** - Core tables and relationships
2. **002_rls_policies.sql** - Row Level Security for data access
3. **003_indexes.sql** - Performance indexes for queries
4. **004_add_email_auth_v2.sql** - Email authentication support

---

## Authentication Flow

### Registration
1. User visits `/register`
2. Enters: email, name, city
3. POST `/api/auth/email-login` with user data
4. Supabase sends magic link to email
5. User clicks link → redirected to `/auth/callback?code=xxx`
6. Callback creates user profile and session
7. Redirects to `/trips` (logged in)

### Login
1. User visits `/login`
2. Enters: email
3. POST `/api/auth/email-login`
4. Supabase sends magic link
5. User clicks link → `/auth/callback`
6. Redirects to `/trips` (logged in)

### Session Management
- Sessions stored in HttpOnly cookies
- Server-side validation via `supabase.auth.getUser()`
- Middleware protects routes: `/trips`, `/profile`, `/rides/new`
- Protected API routes: `/api/bookings`, `/api/messages`, `/api/ratings`

---

## Core Features

### 1. Ride Search & Discovery
- **Location**: Filter by origin and destination city
- **Date/Time**: Filter by departure date and time period
- **Capacity**: Filter by number of seats needed
- **Sorting**: Sort by price, departure time, rating
- **Results**: Paginated list with driver info, car details, rating

### 2. Booking System
- **Book Ride**: Select seats, add message, confirm booking
- **My Bookings**: View upcoming and past bookings
- **Cancellation**: Cancel booking (with reason)
- **Notifications**: In-app messages for booking updates

### 3. Messaging
- **Direct Messages**: Driver ↔ Passenger per booking
- **Quick Messages**: Pre-set templates ("On my way", "Running late")
- **Read Receipts**: Track message read status
- **Notifications**: Badge count for unread messages

### 4. Rating System
- **Post-Ride**: Rate driver after completed ride
- **Mutual**: Drivers can rate passengers
- **Scale**: 1-5 stars with optional comment
- **Display**: Average rating on profiles and ride listings
- **Trust**: Build reputation over time

### 5. Profile Management
- **View Profile**: Name, city, rating, total rides
- **Driver Profile**: Car model, color, driving experience
- **Edit**: Update name, city, bio
- **Become Driver**: Add car details to start offering rides

---

## Data & Content

### Test Data (Seeded)
- **50 Users**: Albanian names, realistic profiles
  - ~40% drivers with car details
  - Ratings: 4.0-5.0 stars
  - Cities: Distributed across all 15 cities

- **100 Rides**: Popular routes, realistic pricing
  - Tirana → Durrës: 500 Lek (~40 min)
  - Tirana → Vlorë: 1500 Lek (~150 min)
  - Tirana → Shkodër: 1200 Lek (~120 min)
  - Departure times: Next 14 days, 6am-10pm

- **147 Bookings**: Mix of confirmed and cancelled
  - 90% confirmed, 10% cancelled
  - 1-2 seats per booking
  - Realistic distribution

- **200 Messages**: Conversations between users
  - Common questions and responses
  - ~70% read, ~30% unread
  - Mix of regular and quick messages

- **120 Ratings**: Positive reviews
  - Mostly 4-5 stars
  - ~60% with comments
  - All visible

### Albanian Cities (15)
**Major Cities:**
- Tirana (TIA) - Capital
- Durrës (DUR) - Port city
- Vlorë (VLO) - Coastal
- Shkodër (SHK) - Northern
- Elbasan (ELB) - Central
- Fier (FIE) - Southern
- Korçë (KOR) - Southeast
- Berat (BER) - Historic

**Other Cities:**
Lushnjë, Kavajë, Pogradec, Gjirokastër, Sarandë, Laç, Kukës

---

## Environment Setup

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# App
NEXT_PUBLIC_APP_URL=https://albania-rides.vercel.app
```

### Optional

```bash
# Weather (if implementing weather features)
WEATHER_API_KEY=xxx
```

### Get from Vercel

```bash
vercel env pull .env.local
```

This pulls all environment variables from Vercel deployment.

---

## Development Commands

### Setup
```bash
npm install                      # Install dependencies
vercel env pull .env.local       # Get environment variables
```

### Development
```bash
npm run dev                      # Start dev server (localhost:3000)
npm run build                    # Build for production
npm start                        # Start production server
npm run lint                     # Run ESLint
```

### Database
```bash
# Run migration in Supabase SQL Editor (manual)
# Copy/paste contents of supabase/migrations/004_add_email_auth_v2.sql

# Seed test data
set -a && source .env.local && set +a && npm run db:seed
```

### Testing
```bash
npm test                         # Run Vitest unit tests
npm run test:e2e                 # Run Playwright E2E tests
```

### Deployment
```bash
git push origin main             # Auto-deploy to Vercel
vercel --prod                    # Manual production deploy
```

---

## Deployment

### Current Deployment
- **URL**: https://albania-rides-hffyslid0-phoebusdevs-projects.vercel.app
- **Status**: ✅ Live
- **Auto-deploy**: Enabled from GitHub main branch
- **Commit**: 282875b

### Deployment Flow
1. Push to GitHub main branch
2. Vercel detects push
3. Runs `npm run build`
4. Deploys to production
5. Updates deployment URL

### Manual Deploy
```bash
vercel --prod
```

### Environment Variables (Vercel)
Set in Vercel Dashboard → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## Supabase Setup

### Required Steps

1. **Run Migration 004 v2**
   - Supabase Dashboard → SQL Editor
   - Copy/paste `supabase/migrations/004_add_email_auth_v2.sql`
   - Click "Run"

2. **Enable Email Provider**
   - Authentication → Providers
   - Toggle "Email" ON
   - Disable "Confirm email" for testing

3. **Configure URLs**
   - Authentication → URL Configuration
   - Site URL: `https://albania-rides-hffyslid0-phoebusdevs-projects.vercel.app`
   - Redirect URLs: Add `/auth/callback`

### Database Access
- **Dashboard**: https://supabase.com/dashboard
- **Project**: albania-rides
- **Region**: US East (AWS)

---

## Security

### Authentication
- ✅ Email magic links (no passwords to leak)
- ✅ HttpOnly cookies (XSS protection)
- ✅ Server-side session validation
- ✅ Automatic session refresh

### Headers (middleware.ts)
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### Data Protection
- ✅ Row Level Security (RLS) policies
- ✅ Parameterized queries (SQL injection protection)
- ✅ Input validation (server-side)
- ✅ Rate limiting (via Vercel Edge)

---

## Performance

### Build Optimizations
- ✅ Static page generation where possible
- ✅ Server Components for data fetching
- ✅ Client Components only when needed
- ✅ Image optimization (next/image)
- ✅ Font optimization (next/font)

### Database
- ✅ Indexes on common queries
- ✅ Connection pooling (Supabase)
- ✅ Efficient RLS policies

### Caching
- ✅ Static assets cached (Vercel CDN)
- ✅ API route caching headers
- ✅ Browser caching for assets

---

## Known Issues & Limitations

### Build Warnings (Non-Critical)
- Metadata deprecations (`themeColor`, `viewport`)
- Edge Runtime warnings for Supabase (expected)
- Export error on `/login` (not using static export)

### Features Not Implemented
- ❌ Phone number as optional contact field
- ❌ Push notifications
- ❌ Google OAuth (planned)
- ❌ Payment processing (intentionally cash-only)
- ❌ Recurring rides (database ready, UI pending)
- ❌ Weather integration (API key ready, UI pending)

### Database Notes
- Test data uses `@albaniarides.test` emails
- Safe to delete test data anytime
- Phone encryption utils exist but unused

---

## Cost Analysis

### Current Costs: $0/month

**Supabase Free Tier:**
- Database: Free (up to 500MB)
- Auth: Unlimited email auth (free)
- Bandwidth: 2GB/month (free)

**Vercel Hobby:**
- Hosting: Free
- Bandwidth: 100GB/month (free)
- Builds: Unlimited (free)

### Savings vs SMS Auth
- **Before** (Twilio SMS): $0.05/user = $50/month for 1,000 users
- **After** (Email): $0/user = $0/month
- **Annual Savings**: $600 for 1,000 users

---

## Future Enhancements

### Priority 1 (High Impact)
1. **Google OAuth** - Faster login, ~1 hour implementation
2. **Push Notifications** - Booking updates, message alerts
3. **Mobile App** - React Native or wrap PWA
4. **Email Notifications** - Free via Supabase

### Priority 2 (Medium Impact)
1. **Recurring Rides** - Daily/weekly commutes (DB ready)
2. **Weather Display** - Show conditions for ride times
3. **Phone as Contact** - Optional field in profile
4. **Multi-language** - Albanian/English toggle

### Priority 3 (Nice to Have)
1. **Custom Email Templates** - Branded magic link emails
2. **Admin Dashboard** - Moderate users, view analytics
3. **Report System** - Flag inappropriate content
4. **Verified Drivers** - Badge system

---

## Testing Strategy

### Unit Tests (Vitest)
- Utility functions
- Validation logic
- Data transformations

### Integration Tests (Vitest)
- API routes
- Database operations
- Auth flows

### E2E Tests (Playwright)
- User registration
- Login flow
- Ride search
- Booking creation
- Messaging

### Manual Testing
- Test with seed data
- Multiple user accounts
- Different city combinations
- Mobile responsiveness

---

## Support & Documentation

### Key Documents
- **CLAUDE.md** - Developer guide and commands
- **EMAIL_AUTH_STATUS.md** - Auth deployment status
- **EMAIL_AUTH_SETUP_INSTRUCTIONS.md** - Supabase configuration
- **SEED_INSTRUCTIONS.md** - Database seeding guide
- **AUTH_MIGRATION_PLAN.md** - SMS → Email migration strategy
- **PROJECT_SUMMARY.md** - This file

### External Docs
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

### Repository
- **GitHub**: https://github.com/phoebusdev/albania-rides
- **Branch**: main
- **Auto-deploy**: Enabled

---

## Contributors

- **Development**: Claude Code (Anthropic)
- **Deployment**: Automated via Vercel
- **Infrastructure**: Supabase + Vercel

---

## License

Proprietary - All rights reserved

---

**Last Updated**: September 30, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready