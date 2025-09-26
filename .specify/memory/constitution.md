# AlbaniaRides Constitution

## Core Principles

### I. Trust Through Simplicity
Every trust mechanism must be transparent and user-verifiable. Phone number verification using Albanian +355 numbers serves as primary identity. User profiles with real names and photos build community trust. No complex verification systems that users cannot understand or that create barriers to entry.

### II. Mobile-First Architecture
All features must be optimized for mobile browsers on 3G/4G networks. Initial page load must complete within 3 seconds on average Albanian network speeds. Progressive enhancement approach: core functionality works on basic browsers, enhanced features for modern browsers. Touch-optimized interfaces with minimum 44px touch targets.

### III. Offline Payment Model (NON-NEGOTIABLE)
The platform facilitates connections only - all payments happen offline between users. Every booking interface must clearly state "Cash payment to driver". No payment processing, no stored payment methods, no transaction fees. Platform liability explicitly limited to connection facilitation only.

### IV. Test-First Development
TDD mandatory for all booking flow features. Tests written → User approved → Tests fail → Then implement. Critical paths requiring comprehensive testing: Phone verification flow, Booking creation and cancellation, Driver-passenger matching, Rating submission. Integration tests using real SMS providers in test mode.

### V. Data Efficiency
Minimize data usage for users with limited mobile plans. Lazy loading for all images with progressive JPEG. API responses must be paginated (max 20 items). No auto-playing media or unnecessary background requests. Cache aggressively with service workers for repeat visits.

## Architectural Constraints

### Performance Standards
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3s on 3G
- Lighthouse Performance Score: > 85
- Bundle size budget: < 200KB JavaScript (gzipped)

### Scalability Requirements
- Start with single region deployment (Tirana)
- Database schema must support multi-city expansion without migration
- City-specific data stored as configuration, not hardcoded
- Prepared for horizontal scaling when user base exceeds 10,000 active users
- CDN-ready static assets from day one

### Security & Compliance
- GDPR compliant data handling for EU standards
- Phone numbers stored with encryption at rest
- User deletion must remove all personal data within 30 days
- Session tokens expire after 7 days of inactivity
- Rate limiting on all authentication endpoints
- Content Security Policy (CSP) headers on all responses

## Development Workflow

### Code Quality Gates
- All PRs require passing tests (minimum 80% coverage for critical paths)
- TypeScript strict mode enabled - no any types in business logic
- Accessibility audit must pass WCAG 2.1 AA standards
- No console.logs or debug code in production builds
- Database migrations must be reversible

### Internationalization Ready
- All user-facing strings in translation files from day one
- English as primary language for MVP
- Albanian (sq-AL) locale structure prepared but not implemented
- RTL support not required but component architecture should not prevent it
- Date/time formatting using user's locale

### Minimal Infrastructure
- Single Supabase project for MVP (free tier)
- Vercel deployment with automatic preview deployments
- SMS provider with pay-as-you-go pricing (no monthly minimums)
- Error tracking via Sentry free tier
- Analytics via Vercel Analytics or similar zero-cost solution

## Community Standards

### User Safety First
- Report feature prominent on all user interactions
- 24-hour response commitment for safety reports
- Automatic suspension after 3 verified reports pending review
- Clear community guidelines in Albanian and English
- Driver ratings below 3.5 stars trigger review after 10 rides

### Transparency
- Public roadmap of upcoming features
- Clear data usage policy
- Explicit about cash-only model in all materials
- Open about platform limitations and liability
- Incident transparency for service disruptions

## Governance

This constitution supersedes all implementation decisions. When technical choices conflict with these principles, the principles must prevail. Amendments require:
- Documentation of rationale with real user feedback
- Impact assessment on existing users
- Migration plan if breaking changes required
- Review by at least two team members

All development must verify constitutional compliance at:
- Specification phase
- Planning phase
- Code review phase
- Pre-deployment checklist

**Version**: 1.0.0 | **Ratified**: 2024-09-26 | **Last Amended**: 2024-09-26