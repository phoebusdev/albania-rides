# AlbaniaRides 🚗

Modern, cash-based ridesharing platform for Albania built with Next.js 14 and Supabase.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://albania-rides-hffyslid0-phoebusdevs-projects.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)](https://supabase.com/)

**Live Demo**: https://albania-rides-hffyslid0-phoebusdevs-projects.vercel.app

---

## Features

✅ **Email Magic Link Auth** - No passwords, secure, zero SMS costs
✅ **Real-time Ride Search** - Filter by city, date, time, seats
✅ **Booking System** - Confirm, cancel, manage reservations
✅ **In-app Messaging** - Direct driver-passenger communication
✅ **Mutual Ratings** - 5-star review system for trust
✅ **15 Albanian Cities** - Tirana, Durrës, Vlorë, Shkodër, and more
✅ **Cash-only Payments** - Zero transaction fees
✅ **PWA Ready** - Progressive Web App with offline support

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/phoebusdev/albania-rides.git
cd albania-rides
npm install
```

### 2. Environment Setup
```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Or manually create .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
Run migration in Supabase SQL Editor:
```sql
-- Copy/paste: supabase/migrations/004_add_email_auth_v2.sql
```

Enable email auth in Supabase Dashboard:
- Authentication → Providers → Email (toggle ON)
- Authentication → URL Configuration → Add redirect URL

### 4. Seed Test Data
```bash
set -a && source .env.local && set +a && npm run db:seed
```

Creates:
- 50 users (Albanian names, drivers + passengers)
- 100 rides (popular routes, realistic prices)
- 147 bookings
- 200 messages
- 120 ratings

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Language**: TypeScript 5.3 (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email magic links)
- **Styling**: Tailwind CSS 3
- **Deployment**: Vercel
- **PWA**: next-pwa

---

## Project Structure

```
app/
├── (auth)/           # Login, register (email magic link)
├── (main)/           # Protected routes (rides, trips, profile)
├── (static)/         # Public pages (FAQ, safety)
├── api/              # API routes (auth, rides, bookings, messages)
└── auth/callback/    # Magic link handler

lib/
├── supabase/         # Database clients (server, client)
├── utils/            # Validation, utilities
└── constants/        # Cities, routes, time periods

scripts/
└── seed.js           # Database seeding script

supabase/migrations/  # Schema (001-004)
```

---

## Scripts

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npm run db:seed      # Seed test data
```

### Testing
```bash
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

### Deployment
```bash
git push origin main # Auto-deploy to Vercel
vercel --prod        # Manual deploy
```

---

## Albanian Cities Supported

**Major**: Tirana, Durrës, Vlorë, Shkodër, Elbasan, Fier, Korçë, Berat
**Others**: Lushnjë, Kavajë, Pogradec, Gjirokastër, Sarandë, Laç, Kukës

Popular routes with realistic pricing (500-1800 Lek per seat).

---

## Authentication Flow

1. User enters email at `/register` or `/login`
2. Supabase sends magic link to email
3. User clicks link → redirected to `/auth/callback`
4. Session created, user profile auto-created
5. Redirected to `/trips` (logged in)

**No passwords, no SMS costs, secure!**

---

## Database Schema

- **users** - Profiles (email, name, city, driver details, rating)
- **rides** - Ride offers (origin, destination, time, seats, price)
- **bookings** - Reservations (confirmed/cancelled)
- **messages** - Driver-passenger chat
- **ratings** - 5-star reviews

See `supabase/migrations/` for full schema.

---

## Cost Analysis

### Current: $0/month

- **Supabase Free Tier**: 500MB DB, unlimited email auth, 2GB bandwidth
- **Vercel Hobby**: Free hosting, 100GB bandwidth, unlimited builds

### Savings vs SMS Auth
- Before (Twilio): $0.05/user = $50/mo for 1K users
- After (Email): $0/user = $0/mo
- **Annual Savings**: $600 for 1K users

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Developer guide and commands
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview
- **[EMAIL_AUTH_STATUS.md](EMAIL_AUTH_STATUS.md)** - Auth deployment status
- **[SEED_INSTRUCTIONS.md](SEED_INSTRUCTIONS.md)** - Database seeding guide

---

## Deployment

**Production URL**: https://albania-rides-hffyslid0-phoebusdevs-projects.vercel.app

Auto-deploys from `main` branch to Vercel.

Manual deploy:
```bash
vercel --prod
```

---

## Security

✅ Email magic links (no passwords)
✅ HttpOnly cookies (XSS protection)
✅ Server-side session validation
✅ CSP + security headers
✅ Row Level Security (RLS)
✅ Parameterized queries

---

## Future Enhancements

### Priority 1
- Google OAuth (1 hour)
- Push notifications
- Mobile app (React Native)

### Priority 2
- Recurring rides (DB ready)
- Weather display
- Multi-language (Albanian/English)

### Priority 3
- Custom email templates
- Admin dashboard
- Verified drivers badge

---

## Contributing

This is a proprietary project. For questions or suggestions, open an issue.

---

## License

Proprietary - All rights reserved

---

## Support

- **Issues**: Open a GitHub issue
- **Docs**: See `CLAUDE.md` and `PROJECT_SUMMARY.md`
- **Deployment**: Check Vercel dashboard

---

**Built with ❤️ using Next.js 14, Supabase, and Vercel**