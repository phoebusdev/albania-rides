# AlbaniaRides - Code Review Issues

**Date**: September 30, 2025
**Review Type**: Correctness audit of existing functionality

---

## Critical Issues (Must Fix)

### 🚨 Issue #1: Database Column Name Mismatch - `seats_booked` vs `seats_count`

**Severity**: CRITICAL - Blocks all booking operations

**Problem**: The database schema uses `seats_booked` but all API code uses `seats_count`

**Locations**:
- Schema defines: `supabase/migrations/001_initial_schema.sql:108` → `seats_booked INTEGER NOT NULL`
- API uses `seats_count`:
  - `app/api/bookings/route.ts:101` - Request parameter
  - `app/api/bookings/route.ts:111, 114` - Validation
  - `app/api/bookings/route.ts:177` - INSERT statement field name
  - `app/api/bookings/route.ts:179` - Price calculation
  - `app/api/bookings/[id]/route.ts:75` - UPDATE seats_available calculation
  - `app/api/bookings/[id]/route.ts:88` - Cancellation SMS message
  - `app/api/rides/[id]/route.ts:112` - SELECT for booked seats
  - `app/api/rides/[id]/route.ts:116` - Reduce function on seats_count

**Impact**:
- Creating bookings will fail with "column seats_count does not exist"
- Updating rides will fail when checking booked seats
- Cancelling bookings will fail

**Fix Options**:
1. Change schema column from `seats_booked` to `seats_count` (requires migration)
2. Change all API code from `seats_count` to `seats_booked` (easier)

**Recommended**: Option 2 - Change API code to use `seats_booked`

---

### 🚨 Issue #2: JWT Payload Claim Name Mismatch

**Severity**: CRITICAL - Blocks all authentication

**Problem**: JWT creation uses `sub` claim but verification expects `userId` claim

**Locations**:
- JWT creation: `app/api/auth/verify/route.ts:50-53`
  ```typescript
  const token = await new SignJWT({
    sub: user.id,  // ← Uses 'sub'
    phone: formattedPhone,
    name: user.name
  })
  ```
- JWT verification: `lib/utils/jwt.ts:25`
  ```typescript
  if (payload && typeof payload === 'object' && 'userId' in payload && 'phone' in payload) {
    return payload as unknown as JWTPayload  // ← Expects 'userId'
  }
  ```
- JWT interface: `lib/utils/jwt.ts:6-10`
  ```typescript
  export interface JWTPayload {
    userId: string  // ← Defines 'userId'
    phone: string
    exp?: number
  }
  ```
- Usage: `lib/utils/jwt.ts:47`
  ```typescript
  return payload?.userId || null  // ← Returns undefined because 'userId' doesn't exist
  ```

**Impact**:
- JWT verification will always fail
- `getUserIdFromRequest()` will always return `null`
- All protected API endpoints will return 401 Unauthorized
- Users cannot access bookings, profile, create rides, etc.

**Fix Options**:
1. Change JWT creation from `sub` to `userId`
2. Change JWT interface and verification from `userId` to `sub`

**Recommended**: Option 1 - Change JWT creation to use `userId` (matches the interface)

---

## Minor Issues

### ⚠️ Issue #3: City Code vs City Name Mismatch

**Severity**: MINOR - Data inconsistency

**Problem**: Users table expects city codes ('TIA', 'DUR') but registration stores city names

**Locations**:
- Register page: `app/(auth)/register/page.tsx:120`
  ```tsx
  <option key={city.code} value={city.name}>
    {city.name}
  </option>
  ```
- Register API: `app/api/auth/register/route.ts` (inferred from page input)
- Schema: `users.city TEXT NOT NULL` (no FK constraint, accepts anything)
- Foreign keys: Rides table uses `origin_city TEXT NOT NULL` (no FK to cities table)

**Impact**:
- Database will contain "Tirana" instead of "TIA"
- Not breaking because there's no FK constraint
- But inconsistent with seed data and convention

**Fix**: Change register page to use `city.code` as value instead of `city.name`

---

### ⚠️ Issue #4: Incomplete Booking Cancellation Fields

**Severity**: MINOR - Missing audit data

**Problem**: `cancelled_by` field is never set when cancellations occur

**Locations**:
- Schema has field: `supabase/migrations/001_initial_schema.sql:117`
  ```sql
  cancelled_by TEXT CHECK (cancelled_by IN ('passenger', 'driver', 'system', NULL)),
  ```
- Booking cancellation: `app/api/bookings/[id]/route.ts:63-69`
  ```typescript
  await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
      // ← Missing: cancelled_by
    })
  ```

**Impact**: Cannot audit who cancelled bookings (passenger vs driver)

**Fix**: Set `cancelled_by` field based on who initiates cancellation:
- Line 44: Check if `booking.passenger_id === userId` → set `cancelled_by: 'passenger'`
- Otherwise → set `cancelled_by: 'driver'`

---

### ⚠️ Issue #5: TODO Comment - Missing SMS Notifications on Ride Deletion

**Severity**: MINOR - Incomplete feature

**Problem**: Driver cancelling a ride doesn't notify passengers

**Location**: `app/api/rides/[id]/route.ts:207`
```typescript
// TODO: Send SMS notifications to all passengers
```

**Impact**: Passengers don't know their ride was cancelled

**Fix**: Query all confirmed bookings, decrypt passenger phone numbers, send SMS notifications

---

## Positive Findings ✅

- ✅ Middleware correctly checks auth headers and applies to right routes
- ✅ Security headers properly set (CSP, X-Frame-Options, etc.)
- ✅ Phone encryption/decryption using AES-256-GCM is correct
- ✅ Validation functions are sound (phone format, seat counts, prices)
- ✅ Test mode fallbacks work correctly (accepts code 123456)
- ✅ Database schema is well-designed with CHECK constraints
- ✅ RLS policies exist (migration 002)
- ✅ Error handling includes detailed debug info
- ✅ No SQL injection vulnerabilities (using Supabase client properly)
- ✅ Input sanitization in place

---

## Priority Fix Order

1. **CRITICAL #2** - Fix JWT claim mismatch (auth completely broken)
2. **CRITICAL #1** - Fix seats_booked/seats_count mismatch (bookings broken)
3. **MINOR #3** - Fix city code vs name (data consistency)
4. **MINOR #4** - Add cancelled_by field (audit trail)
5. **MINOR #5** - Implement ride cancellation SMS (nice-to-have)

---

**Total Issues**: 2 Critical, 3 Minor
**Estimated Fix Time**: 30-45 minutes for critical issues