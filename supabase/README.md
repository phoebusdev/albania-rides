# Database Setup & Seed Data

## Running Migrations

To set up the database schema, run these migrations in order via your Supabase SQL Editor:

1. **001_initial_schema.sql** - Creates tables (users, rides, bookings, messages, ratings, cities, city_routes)
2. **002_rls_policies.sql** - Sets up Row Level Security policies
3. **003_indexes.sql** - Creates performance indexes

## Running Seed Data

After migrations are complete, run **seed.sql** to populate:

- **15 Albanian cities** with coordinates and regions
- **38 popular city routes** with distances and typical durations
- **5 test drivers** with realistic profiles and ratings
- **12 test rides** covering popular routes (tomorrow and day after)

## Test Data Overview

### Test Drivers
- **Alban Berisha** (Tirana) - Mercedes E-Class, 4.8★, 127 trips
- **Erjon Hoxha** (Durrës) - BMW 5 Series, 4.9★, 203 trips
- **Mirela Krasniqi** (Vlorë) - Audi A6, 4.7★, 89 trips
- **Fjola Dervishi** (Shkodër) - Toyota Camry, 5.0★, 156 trips
- **Klodian Gjoka** (Tirana) - VW Passat, 4.6★, 74 trips

### Test Rides (Starting Tomorrow)
- **Tirana → Durrës**: 2 rides (morning & afternoon) - 450-500 Lekë
- **Durrës → Tirana**: 1 ride (afternoon) - 500 Lekë
- **Tirana → Vlorë**: 2 rides (morning & afternoon) - 1,400-1,500 Lekë
- **Vlorë → Tirana**: 1 ride (day after tomorrow) - 1,500 Lekë
- **Tirana → Shkodër**: 2 rides (morning & evening) - 1,000-1,100 Lekë
- **Shkodër → Tirana**: 1 ride (afternoon) - 1,000 Lekë
- **Tirana → Elbasan**: 1 ride (midday) - 600 Lekë
- **Durrës → Vlorë**: 1 ride (day after tomorrow) - 1,200 Lekë
- **Tirana → Korçë**: 1 ride (day after tomorrow) - 1,800 Lekë

## Testing the App

After running seed data, you can immediately:

1. **Search for rides** on the home page
2. **Browse rides** from Tirana to Durrës (most popular route)
3. **View driver profiles** with ratings and trip history
4. **See realistic pricing** based on distance

## Important Notes

⚠️ **Encrypted Phone Numbers**: The seed data uses placeholder encrypted phone values. In production, users must register through the app to get properly encrypted phone numbers.

⚠️ **Dynamic Dates**: Rides are created with `CURRENT_DATE + INTERVAL` so they're always in the future (tomorrow or day after).

⚠️ **Materialized View**: The `ride_search` materialized view is refreshed after seeding for optimal search performance.

## Resetting Data

To reset and re-seed:

```sql
-- Clear test data (keeps schema)
DELETE FROM ratings;
DELETE FROM messages;
DELETE FROM bookings;
DELETE FROM rides;
DELETE FROM users WHERE id LIKE '550e8400-%';

-- Re-run seed.sql
```

## Production Deployment

For production:
1. Run migrations only (001, 002, 003)
2. Run seed.sql for cities and routes ONLY
3. Skip the test users and rides (they're for development)
4. Users will register through the app