# QuickStart: AlbaniaRides Platform Validation

This guide validates that the AlbaniaRides platform meets all requirements through manual testing.

## Prerequisites

- Node.js 20+ installed
- Supabase project created
- Twilio account with test credentials
- Modern mobile browser for testing

## Setup

```bash
# Clone and install
git clone [repository]
cd albania-rides
npm install

# Environment setup
cp .env.example .env.local
# Fill in:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_VERIFY_SERVICE_SID
# - PHONE_ENCRYPTION_KEY (generate with: openssl rand -hex 32)

# Database setup
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

## Test Accounts

Use these test phone numbers (Twilio test mode):
- Driver: +355691234567 (OTP: 123456)
- Passenger: +355692345678 (OTP: 123456)
- Admin: +355693456789 (OTP: 123456)

## Validation Scenarios

### 1. User Registration & Verification (FR-001, FR-002)

**Steps:**
1. Navigate to `/register`
2. Enter test phone number +355691234567
3. Fill in: Name "Test Driver", City "Tirana"
4. Submit form
5. Enter OTP: 123456
6. Verify redirect to profile setup

**Expected:**
- ✅ SMS sent message displayed
- ✅ OTP input appears
- ✅ After verification, JWT token stored
- ✅ Profile created with verified status

### 2. Driver Profile Setup (FR-003)

**Steps:**
1. After registration, navigate to `/profile`
2. Toggle "I want to offer rides"
3. Fill in:
   - Car Model: "Toyota Corolla"
   - Car Color: "Silver"
   - Driving Years: 5
   - Bio: "Safe driver, non-smoking"
4. Upload profile photo
5. Save profile

**Expected:**
- ✅ Driver fields appear when toggled
- ✅ Photo uploads and displays
- ✅ All fields saved correctly

### 3. Post a Ride (FR-007 to FR-013)

**Steps:**
1. Navigate to `/rides/new`
2. Fill in:
   - From: "Tirana"
   - To: "Durrës"
   - Date: Tomorrow
   - Time: 14:00
   - Pickup: "Skanderbeg Square"
   - Seats: 3
   - Price: 500 ALL
3. Toggle "Luggage space available"
4. Add stop: "Kamëz"
5. Submit ride

**Expected:**
- ✅ City dropdowns show all 15 Albanian cities
- ✅ Date picker prevents past dates
- ✅ Price shows "ALL" currency
- ✅ Ride created and visible in search

### 4. Search for Rides (FR-014 to FR-019)

**Steps:**
1. Navigate to home page
2. Search:
   - From: "Tirana"
   - To: "Durrës"
   - Date: Tomorrow
3. Apply filter: "Morning (5-12)"
4. Sort by: "Lowest price"
5. View results

**Expected:**
- ✅ Results show matching rides only
- ✅ Each ride shows driver photo, name, rating
- ✅ Price displays with "Cash payment only"
- ✅ Maximum 20 results per page
- ✅ Pagination works if >20 results

### 5. Book a Ride (FR-020 to FR-026)

**Steps:**
1. From search results, click a ride
2. View ride details
3. Select 2 seats
4. Add message: "I'll have one suitcase"
5. Click "Book Now"
6. Verify booking confirmation

**Expected:**
- ✅ Ride details show all information
- ✅ Booking instant (no approval needed)
- ✅ SMS notification simulated
- ✅ Driver contact visible after booking
- ✅ "Payment in cash to driver" clearly stated

### 6. Driver Views Bookings (FR-027)

**Steps:**
1. Login as driver
2. Navigate to `/trips`
3. Switch to "As Driver" tab
4. View upcoming ride with bookings

**Expected:**
- ✅ Shows all bookings for the ride
- ✅ Passenger names and photos visible
- ✅ Total seats booked displayed
- ✅ Contact information available

### 7. Cancel Booking (FR-026)

**Steps:**
1. As passenger, go to `/trips`
2. Find upcoming booking
3. Verify departure >2 hours away
4. Click "Cancel Booking"
5. Confirm cancellation

**Expected:**
- ✅ Cancellation succeeds if >2 hours
- ✅ Seats returned to available
- ✅ Both parties notified
- ✅ Booking shows as cancelled

### 8. In-App Messaging (FR-036 to FR-039)

**Steps:**
1. After booking, click "Message Driver"
2. Send quick message: "I'm ready"
3. Type custom message
4. Send message
5. Driver views and replies

**Expected:**
- ✅ Quick messages available
- ✅ Messages appear in real-time
- ✅ Only visible to driver/passenger pair
- ✅ Phone numbers visible in chat

### 9. Complete Trip & Rating (FR-031 to FR-035)

**Steps:**
1. Wait for ride time to pass (or manually mark complete)
2. System prompts for rating
3. Rate driver 5 stars
4. Add comment: "Great ride!"
5. Submit rating

**Expected:**
- ✅ Rating prompt after 24 hours
- ✅ 1-5 star selection
- ✅ Comment field (max 500 chars)
- ✅ Rating affects driver's average
- ✅ Visible after mutual rating

### 10. Mobile Performance Test (NFR-001, NFR-002)

**Steps:**
1. Open Chrome DevTools
2. Network tab → Slow 3G
3. Device toolbar → iPhone SE
4. Navigate to home page
5. Run Lighthouse audit

**Expected:**
- ✅ Page loads <3 seconds
- ✅ Touch targets ≥44px
- ✅ Responsive layout works
- ✅ Images lazy load
- ✅ Lighthouse score >85

### 11. Offline Capability Test

**Steps:**
1. Load the app
2. Navigate around
3. Go offline (DevTools → Network → Offline)
4. Try to navigate
5. Go back online

**Expected:**
- ✅ Cached pages still work
- ✅ "Offline" indicator appears
- ✅ Forms show offline message
- ✅ Syncs when back online

### 12. Data Validation

**Steps:**
1. Try to register with non-Albanian number: +1234567890
2. Try to book more seats than available
3. Try to post ride with same origin/destination
4. Try to cancel within 2 hours

**Expected:**
- ✅ Non-+355 numbers rejected
- ✅ Overbooking prevented
- ✅ Same city route rejected
- ✅ Late cancellation blocked

## Performance Metrics

Run these checks:

```bash
# Bundle size check
npm run build
# Verify: JS < 200KB gzipped

# Database query performance
npm run test:db-performance
# Verify: All queries <100ms

# API response times
npm run test:api-performance
# Verify: p95 <600ms

# E2E tests
npm run test:e2e
# Verify: All scenarios pass
```

## Security Checklist

- [ ] Phone numbers encrypted in database
- [ ] JWT tokens expire after 7 days
- [ ] Rate limiting on /auth endpoints (5 req/min)
- [ ] HTTPS only in production
- [ ] CSP headers configured
- [ ] No sensitive data in logs

## Deployment Validation

```bash
# Deploy to Vercel
vercel --prod

# Post-deployment checks:
```
1. SSL certificate valid
2. Domain configured correctly
3. Environment variables set
4. Database migrations ran
5. SMS delivery working
6. Error tracking connected (Sentry)
7. Analytics working

## Support & FAQ Pages

Verify static pages:
- `/faq` - Explains cash payment clearly
- `/safety` - Travel tips in place
- `/terms` - Legal disclaimers
- `/privacy` - GDPR compliance

## Troubleshooting

Common issues:

**SMS not received:**
- Check Twilio credentials
- Verify phone number format (+355...)
- Check Twilio logs

**Database errors:**
- Run migrations: `npm run db:migrate`
- Check Supabase connection
- Verify RLS policies

**Slow performance:**
- Check image sizes
- Verify CDN caching
- Review bundle size
- Check database indexes

## Success Criteria

Platform is ready when:
- [ ] All 12 validation scenarios pass
- [ ] Performance metrics met
- [ ] Security checklist complete
- [ ] Deployed successfully
- [ ] Test users can complete full journey

## Next Steps

After validation:
1. Monitor user behavior with analytics
2. Collect feedback via in-app survey
3. Plan Albanian translation
4. Consider iOS/Android apps
5. Explore payment integration options