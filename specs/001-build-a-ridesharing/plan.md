# Implementation Plan: AlbaniaRides - Albanian Ridesharing Platform

**Branch**: `001-build-a-ridesharing` | **Date**: 2024-09-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-build-a-ridesharing/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → SUCCESS: Spec loaded and analyzed
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → All clarifications resolved in spec
   → Project Type: Web (frontend+backend)
   → Structure Decision: Next.js monolithic app with API routes
3. Fill the Constitution Check section
   → Based on AlbaniaRides Constitution v1.0.0
4. Evaluate Constitution Check section
   → All gates pass for MVP approach
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → Technology choices researched and documented
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → API contracts defined, data model created, quickstart ready
7. Re-evaluate Constitution Check section
   → No new violations introduced
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Task generation approach defined
9. STOP - Ready for /tasks command
```

## Summary
Build a ridesharing platform for Albanian market connecting drivers with passengers for intercity travel. Cash-only payment model with SMS verification. Technical approach: Next.js 14 with App Router for SEO and mobile-first performance, Supabase for data persistence, Twilio for SMS verification.

## Technical Context
**Language/Version**: TypeScript 5.3 / Node.js 20 LTS
**Primary Dependencies**: Next.js 14, React 18, Tailwind CSS 3, Supabase Client, Twilio SDK
**Storage**: Supabase (PostgreSQL) free tier with Row Level Security
**Testing**: Vitest for unit/integration, Playwright for E2E
**Target Platform**: Mobile web browsers (Chrome, Safari, Firefox)
**Project Type**: Web (single Next.js app with API routes)
**Performance Goals**: <3s initial load on 3G, <600ms TTFB, >85 Lighthouse score
**Constraints**: <200KB JS bundle, offline-capable with service workers, GDPR compliant
**Scale/Scope**: MVP for 1000 concurrent users, 15 Albanian cities, ~50 screens

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Trust Through Simplicity ✅
- [x] Phone verification with +355 numbers only
- [x] Transparent user profiles with real names/photos
- [x] No complex verification systems

### Mobile-First Architecture ✅
- [x] Optimized for 3G/4G networks
- [x] <3s initial load requirement
- [x] Touch-optimized with 44px targets
- [x] Progressive enhancement approach

### Offline Payment Model ✅
- [x] Cash-only clearly stated everywhere
- [x] No payment processing integration
- [x] Platform liability limited to connections

### Test-First Development ✅
- [x] TDD for all booking flows
- [x] SMS verification in test mode
- [x] Contract tests before implementation

### Data Efficiency ✅
- [x] Lazy loading for images
- [x] Paginated API (20 items max)
- [x] Service worker caching
- [x] <200KB JS bundle target

## Project Structure

### Documentation (this feature)
```
specs/001-build-a-ridesharing/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Next.js 14 App Router Structure
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── verify/
│       └── page.tsx
├── (main)/
│   ├── layout.tsx
│   ├── page.tsx              # Home/Search
│   ├── rides/
│   │   ├── page.tsx          # Search results
│   │   ├── [id]/
│   │   │   └── page.tsx      # Ride details
│   │   └── new/
│   │       └── page.tsx      # Post ride
│   ├── trips/
│   │   └── page.tsx          # My trips
│   ├── profile/
│   │   └── page.tsx          # User profile
│   └── messages/
│       └── [bookingId]/
│           └── page.tsx      # Chat
├── api/
│   ├── auth/
│   │   ├── register/
│   │   ├── verify/
│   │   └── session/
│   ├── rides/
│   │   ├── route.ts          # CRUD rides
│   │   └── [id]/
│   │       └── route.ts
│   ├── bookings/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   ├── messages/
│   │   └── route.ts
│   └── sms/
│       └── webhook/
│           └── route.ts
├── components/
│   ├── ui/                  # Reusable components
│   ├── ride/                # Ride-specific
│   ├── booking/             # Booking-specific
│   └── layout/              # Navigation, footer
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── twilio/
│   │   └── client.ts
│   ├── constants/
│   │   └── cities.ts        # Albanian cities data
│   └── utils/
│       └── validation.ts
└── middleware.ts             # Auth middleware

tests/
├── contracts/               # API contract tests
├── integration/            # User flow tests
├── e2e/                   # Full browser tests
└── unit/                  # Component tests

public/
├── locales/               # i18n files
│   ├── en/
│   └── sq/               # Albanian (prepared)
└── images/

```

**Structure Decision**: Next.js 14 App Router monolithic architecture chosen for:
- SEO optimization via Server Components
- API routes eliminate separate backend
- Built-in image optimization
- Automatic code splitting for performance
- Vercel deployment simplicity

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:
   - SMS provider supporting +355 numbers → Research Twilio Albania coverage
   - Free weather API for Albania → Identify suitable provider
   - Supabase RLS patterns for ridesharing → Best practices research
   - PWA with Next.js 14 → Service worker implementation

2. **Generate and dispatch research agents**:
   ```
   Task 1: "Research Twilio SMS delivery rates and costs for +355 Albania"
   Task 2: "Find free weather APIs with Albanian city coverage"
   Task 3: "Research Supabase Row Level Security patterns for marketplace apps"
   Task 4: "Find Next.js 14 PWA implementation with offline support"
   Task 5: "Research GDPR compliance for phone number storage"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Each decision documented with rationale
   - Alternatives considered and rejected
   - Implementation notes

**Output**: research.md with all technology decisions finalized

## Phase 1: Design & Contracts

1. **Extract entities from feature spec** → `data-model.md`:
   - User (drivers/passengers)
   - Ride (posted trips)
   - Booking (seat reservations)
   - Rating (mutual reviews)
   - Message (driver-passenger chat)
   - City (route data)

2. **Generate API contracts** from functional requirements:
   - REST endpoints for each entity
   - OpenAPI 3.0 specification
   - Request/response schemas
   - Error response standards

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Schema validation tests
   - Auth requirement tests
   - Tests written to fail initially

4. **Extract test scenarios** from user stories:
   - Driver posting ride flow
   - Passenger booking flow
   - SMS verification flow
   - Rating submission flow

5. **Update agent file incrementally**:
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - Add Next.js 14, Supabase, Twilio context
   - Include Albanian cities constants
   - Performance requirements

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate ~40-50 tasks from contracts and data model
- Group by: Setup, Database, Auth, API, UI, Testing
- Each endpoint → API route task + test task
- Each page → component task + test task

**Ordering Strategy**:
1. Project setup and dependencies [P]
2. Database schema and migrations
3. Authentication flow (SMS verification)
4. API routes (tests first, then implementation)
5. UI components (mobile-first)
6. Integration and E2E tests
7. Performance optimization
8. Deployment configuration

**Parallel Execution Groups**:
- [P] All contract tests can be written in parallel
- [P] UI components after API routes complete
- [P] Static pages (FAQ, Safety Tips) anytime

**Estimated Output**: 45-50 numbered, ordered tasks in tasks.md

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks following TDD)
**Phase 5**: Validation (run all tests, quickstart verification, Lighthouse audit)

## Complexity Tracking
*No violations - MVP approach aligns with all constitutional principles*

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - approach defined)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none needed)

---
*Based on AlbaniaRides Constitution v1.0.0 - See `.specify/memory/constitution.md`*