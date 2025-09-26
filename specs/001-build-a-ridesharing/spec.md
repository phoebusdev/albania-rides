# Feature Specification: AlbaniaRides - Albanian Ridesharing Platform

**Feature Branch**: `001-build-a-ridesharing`
**Created**: 2024-09-26
**Status**: Draft
**Input**: User description: "Build a ridesharing platform called AlbaniaRides for the Albanian market that connects drivers offering rides with passengers needing transportation between Albanian cities"

## Execution Flow (main)
```
1. Parse user description from Input
   → Extract: Ridesharing platform, Albanian market focus, driver-passenger connection
2. Extract key concepts from description
   → Actors: Drivers (offer rides), Passengers (book seats), Platform administrators
   → Actions: Post rides, search rides, book seats, cancel bookings, rate trips
   → Data: User profiles, ride listings, bookings, ratings, messages
   → Constraints: Albanian cities only, cash payments offline, SMS verification
3. For each unclear aspect:
   → Marked throughout with [NEEDS CLARIFICATION] tags
4. Fill User Scenarios & Testing section
   → Defined primary user journeys for both drivers and passengers
5. Generate Functional Requirements
   → Each requirement made testable and specific
6. Identify Key Entities
   → Users, Rides, Bookings, Ratings, Messages defined
7. Run Review Checklist
   → WARN: Spec has some uncertainties marked for clarification
8. Return: SUCCESS (spec ready for clarification phase)
```

---

## User Scenarios & Testing

### Primary User Stories

**Driver Journey**
As a driver traveling from Tirana to Durrës, I want to post my available seats and price, so passengers can book and share the fuel costs. I need to know who booked, contact them if needed, and receive cash payment directly from them.

**Passenger Journey**
As a passenger needing to travel from Shkodër to Tirana, I want to find available rides for my travel date, book seats, and get the driver's contact information. I will pay the driver directly in cash when we meet.

### Acceptance Scenarios

1. **Given** a driver with a verified phone number, **When** they post a ride from Tirana to Vlorë with 3 seats at 1500 ALL per seat, **Then** the ride appears in search results for that route and date

2. **Given** a passenger searching for rides, **When** they select Tirana as origin and Durrës as destination for tomorrow, **Then** they see all available rides sorted by departure time with prices in ALL

3. **Given** a passenger viewing a ride, **When** they book 2 seats, **Then** both driver and passenger receive SMS with each other's contact details and pickup location

4. **Given** a booked ride, **When** the passenger cancels more than 2 hours before departure, **Then** the seats become available again and both parties are notified

5. **Given** a completed trip, **When** either party rates the other, **Then** the rating affects the user's overall score and review count

6. **Given** a user without Albanian phone number, **When** they try to register, **Then** they cannot complete registration (restricted to +355 numbers only)

### Edge Cases
- What happens when driver cancels a ride with existing bookings? All passengers notified, bookings auto-cancelled
- How does system handle overbooking attempts? Prevent booking if seats not available
- What if SMS delivery fails? Show phone numbers in app as backup, retry SMS
- How to handle disputes about cash payment? Platform explicitly not responsible, users directed to FAQ
- What prevents fake bookings? Phone verification required, rating system, report feature
- Can users be both driver and passenger? Yes, single account with both capabilities

## Requirements

### Functional Requirements

**User Management**
- **FR-001**: System MUST allow user registration with Albanian (+355) phone number verification via SMS
- **FR-002**: System MUST maintain user profiles with: full name, profile photo, phone number, city of residence, bio, member since date
- **FR-003**: Drivers MUST additionally provide: car make/model, car color, years of driving experience
- **FR-004**: Users MUST be able to switch between driver and passenger roles using single account
- **FR-005**: System MUST allow users to edit their profile information except phone number
- **FR-006**: System MUST implement user suspension after 3 verified reports

**Ride Posting (Drivers)**
- **FR-007**: Drivers MUST be able to post rides between any two Albanian cities from predefined list
- **FR-008**: Albanian cities list MUST include: Tirana, Durrës, Vlorë, Shkodër, Elbasan, Fier, Korçë, Berat, Lushnjë, Kavajë, Pogradec, Gjirokastër, Sarandë, Laç, Kukës
- **FR-009**: Drivers MUST specify: exact pickup point, departure date/time, available seats (1-4), price per person in ALL
- **FR-010**: Drivers MUST be able to optionally specify: stops along route, luggage space availability, smoking preference
- **FR-011**: System MUST support recurring ride posts for regular commuters (daily/weekly patterns, auto-expire after 30 days)
- **FR-012**: Drivers MUST be able to edit rides until first booking is made
- **FR-013**: Drivers MUST be able to cancel rides with notification to all booked passengers

**Ride Search (Passengers)**
- **FR-014**: Passengers MUST be able to search rides by origin and destination cities
- **FR-015**: System MUST provide date filters: today, tomorrow, specific date within 30 days
- **FR-016**: System MUST provide time filters: morning (5-12), afternoon (12-18), evening (18-24)
- **FR-017**: Search results MUST display: driver photo/name, route, time, available seats, price with "Cash payment only" label
- **FR-018**: System MUST allow sorting by: earliest departure, lowest price, driver rating
- **FR-019**: System MUST paginate results showing 20 rides per page

**Booking System**
- **FR-020**: Passengers MUST be able to book 1-4 seats per ride (within availability)
- **FR-021**: Bookings MUST be instant without requiring driver approval
- **FR-022**: System MUST send SMS to both parties with: contact details, pickup location, booking details
- **FR-023**: Booking confirmations MUST clearly state "Payment is made directly to driver in cash"
- **FR-024**: Passengers MUST be able to include optional message to driver when booking
- **FR-025**: System MUST prevent double-booking of same ride by same passenger
- **FR-026**: Cancellations MUST be allowed up to 2 hours before departure time

**Trip Management**
- **FR-027**: Users MUST have "My Trips" page showing upcoming rides as driver or passenger
- **FR-028**: System MUST automatically mark rides as "completed" 24 hours after departure time
- **FR-029**: Users MUST be able to manually mark rides as completed
- **FR-030**: System MUST separate active trips from trip history

**Rating System**
- **FR-031**: Both parties MUST be able to rate each other 1-5 stars after trip completion
- **FR-032**: Ratings MUST be optional but prompted once after trip
- **FR-033**: Users MUST be able to add text comment with rating (max 500 characters)
- **FR-034**: System MUST calculate and display average rating and total rides count
- **FR-035**: Ratings MUST be mutual - visible only after both parties rate or after 7 days timeout

**Communication**
- **FR-036**: System MUST enable in-app messaging only between confirmed driver-passenger pairs
- **FR-037**: Pre-written quick messages MUST include: "Where are you?", "I'm ready", "Running 5 minutes late", "On my way"
- **FR-038**: Phone numbers MUST be hidden until booking confirmation
- **FR-039**: Message history MUST be retained for 30 days after trip completion

**Additional Features**
- **FR-040**: System MUST display typical distance and duration between city pairs
- **FR-041**: System MUST show weather alerts for travel dates (rain/storm warnings from free weather API)
- **FR-042**: System MUST provide "Safe Travel Tips" static content page
- **FR-043**: Users MUST be able to report inappropriate behavior with reason selection
- **FR-044**: System MUST provide FAQ page explaining cash-only payment model
- **FR-045**: Platform MUST clearly state it only facilitates connections, not responsible for payments

### Non-Functional Requirements

- **NFR-001**: System MUST load initial page within 3 seconds on 3G connection
- **NFR-002**: System MUST work on mobile browsers (Chrome, Safari, Firefox mobile versions)
- **NFR-003**: All user data MUST comply with GDPR requirements
- **NFR-004**: System MUST be available in English for MVP
- **NFR-005**: System MUST prepare internationalization structure for Albanian translation

### Key Entities

- **User**: Represents both drivers and passengers with profile information, verification status, ratings
- **Ride**: A trip offer from origin to destination with seats, price, and schedule
- **Booking**: Links passenger to ride with seat count and status
- **Rating**: Post-trip evaluation between driver and passenger
- **Message**: Communication between confirmed driver-passenger pairs
- **City**: Albanian cities with distance/duration data between pairs

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain (all 8 items resolved)
- [x] Requirements are testable and unambiguous (except marked items)
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

### Clarifications Resolved

1. **International phone numbers**: Restrict to +355 Albanian numbers only for MVP to ensure local accountability
2. **Report threshold for suspension**: 3 verified reports trigger automatic suspension pending review
3. **Recurring rides**: Support daily and weekly patterns, auto-expire after 30 days without renewal
4. **Advance booking window**: Rides can be posted up to 30 days in advance
5. **Auto-complete timing**: Mark rides as completed 24 hours after scheduled departure time
6. **Rating visibility timeout**: Show ratings after 7 days if only one party has rated
7. **Message retention**: Keep message history for 30 days after trip completion
8. **Weather data**: Use free weather API for basic rain/storm alerts only

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed (with clarifications needed)

---