# Tasks: AlbaniaRides Platform Implementation

**Input**: Design documents from `/specs/001-build-a-ridesharing/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/api-spec.yaml

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → SUCCESS: Next.js 14, TypeScript, Supabase, Twilio
2. Load optional design documents:
   → data-model.md: 6 entities → model tasks
   → contracts/api-spec.yaml: 15 endpoints → API tasks
   → research.md: Tech decisions → setup tasks
3. Generate tasks by category:
   → Setup: Next.js init, dependencies, environment
   → Database: Schema, migrations, RLS policies
   → Tests: Contract tests, integration tests
   → API: All route implementations
   → UI: Pages and components
   → Integration: SMS, weather, PWA
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T050)
6. Return: SUCCESS (50 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)

## Phase 3.1: Project Setup & Configuration

- [ ] T001 Create Next.js 14 project with TypeScript: `npx create-next-app@14 . --typescript --tailwind --app --src-dir=false`
- [ ] T002 Install core dependencies: `npm install @supabase/supabase-js twilio next-pwa`
- [ ] T003 [P] Install dev dependencies: `npm install -D @types/node vitest @testing-library/react playwright`
- [ ] T004 [P] Create environment configuration in `.env.local` with all required keys
- [ ] T005 [P] Configure TypeScript strict mode in `tsconfig.json`
- [ ] T006 [P] Setup Tailwind mobile-first config in `tailwind.config.js`
- [ ] T007 [P] Configure Next.js for PWA in `next.config.js`
- [ ] T008 Create project structure: `app/`, `components/`, `lib/`, `tests/` directories

## Phase 3.2: Database Setup

- [ ] T009 Initialize Supabase project and get connection details
- [ ] T010 Create database schema from data-model.md in `supabase/migrations/001_initial_schema.sql`
- [ ] T011 [P] Create RLS policies for all tables in `supabase/migrations/002_rls_policies.sql`
- [ ] T012 [P] Create database indexes in `supabase/migrations/003_indexes.sql`
- [ ] T013 [P] Seed Albanian cities data in `supabase/seed.sql`
- [ ] T014 Setup Supabase client utilities in `lib/supabase/client.ts` and `lib/supabase/server.ts`

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T015 [P] Contract test auth endpoints in `tests/contracts/auth.test.ts`
- [ ] T016 [P] Contract test rides endpoints in `tests/contracts/rides.test.ts`
- [ ] T017 [P] Contract test bookings endpoints in `tests/contracts/bookings.test.ts`
- [ ] T018 [P] Contract test messages endpoints in `tests/contracts/messages.test.ts`
- [ ] T019 [P] Contract test ratings endpoints in `tests/contracts/ratings.test.ts`

### Integration Tests
- [ ] T020 [P] Integration test phone verification flow in `tests/integration/phone-verification.test.ts`
- [ ] T021 [P] Integration test ride posting flow in `tests/integration/post-ride.test.ts`
- [ ] T022 [P] Integration test booking flow in `tests/integration/booking.test.ts`
- [ ] T023 [P] Integration test messaging flow in `tests/integration/messaging.test.ts`

## Phase 3.4: Core API Implementation (ONLY after tests are failing)

### Authentication
- [ ] T024 Implement SMS verification with Twilio in `lib/twilio/client.ts`
- [ ] T025 Create auth API routes in `app/api/auth/register/route.ts`
- [ ] T026 Create verify endpoint in `app/api/auth/verify/route.ts`
- [ ] T027 Create session management in `app/api/auth/session/route.ts`
- [ ] T028 Implement auth middleware in `middleware.ts`

### Rides API
- [ ] T029 Create rides GET endpoint (search) in `app/api/rides/route.ts`
- [ ] T030 Create rides POST endpoint (create) in `app/api/rides/route.ts`
- [ ] T031 Create single ride endpoints in `app/api/rides/[id]/route.ts`

### Bookings API
- [ ] T032 Create bookings endpoints in `app/api/bookings/route.ts`
- [ ] T033 Create booking cancellation in `app/api/bookings/[id]/route.ts`

### Other APIs
- [ ] T034 [P] Create messages API in `app/api/messages/route.ts`
- [ ] T035 [P] Create ratings API in `app/api/ratings/route.ts`
- [ ] T036 [P] Create user profile API in `app/api/users/profile/route.ts`

## Phase 3.5: UI Implementation

### Auth Pages
- [ ] T037 [P] Create registration page in `app/(auth)/register/page.tsx`
- [ ] T038 [P] Create verification page in `app/(auth)/verify/page.tsx`
- [ ] T039 [P] Create login page in `app/(auth)/login/page.tsx`

### Main Pages
- [ ] T040 Create home/search page in `app/(main)/page.tsx`
- [ ] T041 Create ride listing page in `app/(main)/rides/page.tsx`
- [ ] T042 Create ride details page in `app/(main)/rides/[id]/page.tsx`
- [ ] T043 Create post ride page in `app/(main)/rides/new/page.tsx`
- [ ] T044 Create my trips page in `app/(main)/trips/page.tsx`
- [ ] T045 Create profile page in `app/(main)/profile/page.tsx`

### Components
- [ ] T046 [P] Create reusable UI components in `components/ui/`
- [ ] T047 [P] Create ride-specific components in `components/ride/`
- [ ] T048 [P] Create booking components in `components/booking/`

## Phase 3.6: Integration & Polish

- [ ] T049 Setup weather API integration for alerts
- [ ] T050 Configure PWA service worker for offline support
- [ ] T051 [P] Create static pages (FAQ, Safety Tips) in `app/(static)/`
- [ ] T052 Setup i18n structure for future Albanian translation
- [ ] T053 Implement performance optimizations (lazy loading, caching)
- [ ] T054 Setup error tracking with Sentry
- [ ] T055 Run full quickstart validation from `quickstart.md`

## Dependencies

- Database (T009-T014) must complete before tests
- All tests (T015-T023) must fail before implementation (T024-T048)
- Auth (T024-T028) blocks other API implementations
- API routes complete before UI pages
- Core features before polish (T049-T055)

## Parallel Execution Examples

```bash
# After setup, run database migrations in parallel:
npm run db:migrate & npm run db:seed

# Run all contract tests in parallel:
npm test tests/contracts/*.test.ts

# Build UI components in parallel while APIs are done:
# Terminal 1: Work on components/ui/
# Terminal 2: Work on components/ride/
# Terminal 3: Work on components/booking/
```

## Critical Path

1. **Setup** (T001-T008): 2 hours
2. **Database** (T009-T014): 2 hours
3. **Write Tests** (T015-T023): 3 hours
4. **Auth Implementation** (T024-T028): 3 hours
5. **Core APIs** (T029-T036): 4 hours
6. **UI Pages** (T037-T048): 6 hours
7. **Integration** (T049-T055): 3 hours

**Total estimated time**: 23 hours of focused development

## Notes

- Verify each test fails before implementing its feature
- Commit after each completed task with descriptive message
- Run `npm run lint` after each phase
- Keep bundle size under 200KB (check with `npm run build`)
- Test on actual mobile device regularly
- Use Twilio test credentials during development

## Validation Checklist

- [x] All API endpoints from contracts have tasks
- [x] All 6 entities have corresponding implementations
- [x] All tests come before implementation tasks
- [x] Parallel tasks are truly independent
- [x] Each task specifies exact file path
- [x] No parallel tasks modify same file
- [x] TDD approach enforced throughout