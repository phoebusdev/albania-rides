# Research Document: AlbaniaRides Technology Decisions

**Date**: 2024-09-26
**Feature**: Albanian Ridesharing Platform

## SMS Provider for +355 Albania

**Decision**: Twilio
**Rationale**:
- Confirmed support for +355 Albanian numbers
- $0.0558 per SMS to Albania (acceptable for verification only)
- Test credentials available for development
- Webhook support for delivery status
- 99.95% uptime SLA

**Alternatives Considered**:
- Vonage: More expensive at $0.0742 per SMS
- AWS SNS: Complex setup, requires pre-registration for Albania
- MessageBird: Good option but less documentation

**Implementation Notes**:
- Use Twilio Verify API for OTP management
- Implement retry logic for failed deliveries
- Store phone numbers hashed with encryption key

## Weather API for Albania

**Decision**: OpenWeatherMap Free Tier
**Rationale**:
- 1000 calls/day free (sufficient for MVP)
- Coverage for all Albanian cities
- Simple integration, no auth complexity
- Returns basic rain/storm alerts

**Alternatives Considered**:
- WeatherAPI: Better free tier but less accurate for Albania
- Tomorrow.io: Excellent but requires credit card
- OpenMeteo: No API key needed but limited alert types

**Implementation Notes**:
- Cache weather data for 1 hour minimum
- Only fetch for active ride dates
- Display as simple icon warnings

## Supabase Row Level Security Patterns

**Decision**: Policy-based RLS with JWT claims
**Rationale**:
- Built-in Supabase auth integration
- Policies execute in database (fast)
- Automatic user context from JWT
- Well-documented marketplace patterns

**Key Patterns**:
```sql
-- Users can only edit own profile
CREATE POLICY users_update ON users
FOR UPDATE USING (auth.uid() = id);

-- Bookings visible to driver and passenger
CREATE POLICY bookings_select ON bookings
FOR SELECT USING (
  auth.uid() IN (
    SELECT driver_id FROM rides WHERE id = ride_id
    UNION
    SELECT passenger_id FROM bookings WHERE id = bookings.id
  )
);

-- Public rides but edit only by owner
CREATE POLICY rides_select ON rides
FOR SELECT USING (status = 'active');

CREATE POLICY rides_update ON rides
FOR UPDATE USING (auth.uid() = driver_id);
```

## PWA Implementation with Next.js 14

**Decision**: next-pwa with Workbox
**Rationale**:
- Mature library, well-maintained
- Automatic service worker generation
- Smart caching strategies built-in
- Compatible with App Router

**Alternatives Considered**:
- Manual service worker: Too complex for MVP
- Serwist: Newer but less documentation
- No PWA: Would miss offline capability requirement

**Implementation Notes**:
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        networkTimeoutSeconds: 10,
      },
    },
  ],
});
```

## GDPR Compliance for Phone Numbers

**Decision**: Encryption at rest + explicit consent
**Rationale**:
- Supabase provides encryption at rest
- Additional application-level encryption for phones
- Clear consent checkboxes
- Data deletion within 30 days

**Implementation Requirements**:
1. Explicit consent checkbox at registration
2. Phone numbers stored with AES-256 encryption
3. User data export endpoint (GDPR Article 20)
4. Hard delete after 30 days of account deletion
5. Privacy policy page required

**Code Pattern**:
```typescript
import { createCipheriv, createDecipheriv } from 'crypto';

function encryptPhone(phone: string): string {
  const cipher = createCipheriv('aes-256-gcm',
    process.env.PHONE_ENCRYPTION_KEY, iv);
  // ... implementation
}
```

## Performance Optimization Strategy

**Decision**: ISR + Edge Caching + Image Optimization
**Rationale**:
- ISR for city route pages (revalidate daily)
- Edge caching via Vercel for static assets
- Next/Image with blur placeholders
- Bundle splitting per route

**Key Optimizations**:
1. Static generation for marketing pages
2. Dynamic imports for heavy components
3. Tailwind CSS purging
4. Font subsetting for English only
5. Cloudflare R2 for user images (future)

## Database Schema Optimization

**Decision**: Denormalized ride search view
**Rationale**:
- Avoid joins during search (mobile performance)
- PostgreSQL materialized view for search
- Refresh every 5 minutes
- Indexes on origin_city, destination_city, departure_date

**View Structure**:
```sql
CREATE MATERIALIZED VIEW ride_search AS
SELECT
  r.id, r.origin_city, r.destination_city,
  r.departure_time, r.price_all, r.seats_available,
  u.name as driver_name, u.photo_url as driver_photo,
  u.rating as driver_rating, u.total_rides
FROM rides r
JOIN users u ON r.driver_id = u.id
WHERE r.status = 'active'
  AND r.departure_time > NOW();

CREATE INDEX idx_ride_search_route
ON ride_search(origin_city, destination_city, departure_time);
```

## Testing Strategy

**Decision**: Vitest + Playwright + MSW
**Rationale**:
- Vitest: Fast, ESM-native, Jest-compatible
- Playwright: Real mobile browser testing
- MSW: Mock external services (SMS, weather)
- Runs in CI via GitHub Actions

**Test Pyramid**:
- Unit: 60% - Components, utilities
- Integration: 30% - API routes, database
- E2E: 10% - Critical user journeys

## Monitoring & Analytics

**Decision**: Vercel Analytics + Sentry
**Rationale**:
- Both have free tiers sufficient for MVP
- Vercel Analytics for Web Vitals
- Sentry for error tracking
- No cookies needed (GDPR friendly)

**Implementation**:
- Track booking conversion funnel
- Monitor API response times
- Alert on SMS delivery failures
- Track city route popularity

## Future Considerations (Post-MVP)

1. **Albanian Language**: Professional translation service needed
2. **Mobile Apps**: React Native to reuse components
3. **Payment Integration**: Local Albanian payment providers
4. **Scale**: Move to dedicated PostgreSQL when >10k users
5. **Real-time**: Add WebSockets for live driver tracking

---

## Summary of Decisions

| Area | Choice | Cost | Risk Level |
|------|--------|------|------------|
| SMS | Twilio | $0.06/SMS | Low |
| Database | Supabase | Free tier | Low |
| Hosting | Vercel | Free tier | Low |
| Weather | OpenWeatherMap | Free | Low |
| Testing | Vitest/Playwright | Free | Low |
| Monitoring | Sentry | Free tier | Low |

Total monthly cost estimate for MVP: ~$50 (mainly SMS costs)

All technology choices align with constitutional requirements for simplicity, performance, and minimal infrastructure costs.