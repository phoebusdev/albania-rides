# Database Seeding Instructions

This guide will help you populate the database with realistic test data.

## What Gets Created

The seed script (`scripts/seed.js`) will create:

- **50 users** - Mix of drivers and passengers with Albanian names
- **100 rides** - Active rides on popular routes
- **150 bookings** - Ride reservations by passengers
- **200 messages** - Conversations between drivers and passengers
- **120 ratings** - Reviews from completed rides

All data uses realistic Albanian names, cities, routes, and prices.

---

## Prerequisites

You need your Supabase credentials. Get them from:
https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

---

## Step-by-Step Instructions

### Step 1: Create Environment File

Create a file named `.env.local` in the project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these values:**

1. Go to Supabase Dashboard
2. Click on your project
3. Left sidebar → Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_KEY` (⚠️ Keep this secret!)

### Step 2: Run the Seed Script

```bash
node scripts/seed.js
```

**Expected output:**
```
🌱 Starting seed script for AlbaniaRides...

🗑️  Clearing existing test data...
✅ Cleared existing data

👥 Creating 50 users...
✅ Created 50 users

🚗 Creating 100 rides...
✅ Created 100 rides

📝 Creating 150 bookings...
✅ Created 120 bookings

💬 Creating 200 messages...
✅ Created 180 messages

⭐ Creating 120 ratings...
✅ Created 95 ratings

✅ Seed completed successfully!

📊 Summary:
   Users: 50
   Rides: 100
   Bookings: 120
   Messages: 180
   Ratings: 95
```

**Time:** ~10-30 seconds depending on connection speed

### Step 3: Verify Data

Go to Supabase Dashboard → Table Editor:

- **users** table - Should have 50+ rows
- **rides** table - Should have 100+ rows
- **bookings** table - Should have 120+ rows
- **messages** table - Should have 180+ rows
- **ratings** table - Should have 95+ rows

### Step 4: Test the App

Visit your deployed app and check:

1. **Rides page** (`/rides`) - Should show many available rides
2. **Search** - Filter by city, date, etc.
3. **Ride details** - Click on a ride to see driver info
4. **Bookings** - Make a test booking
5. **Messages** - Check if messages load

---

## What the Seed Data Includes

### Users (50)
- **Names**: Realistic Albanian names (Andi Hoxha, Elira Meta, etc.)
- **Cities**: Distributed across all 15 Albanian cities
- **Roles**: ~40% are drivers with car details
- **Ratings**: Random ratings between 4.0-5.0
- **Email**: All use `@albaniarides.test` domain

### Rides (100)
- **Routes**: Popular routes like Tirana → Durrës, Tirana → Vlorë
- **Prices**: Realistic prices (500-1800 Lek per seat)
- **Times**: Departures spread over next 14 days
- **Seats**: 1-3 seats available per ride
- **Features**: Mix of luggage space, smoking/non-smoking

### Bookings (150)
- **Status**: 90% confirmed, 10% cancelled
- **Seats**: 1-2 seats per booking
- **Pickup**: Same as ride pickup points
- **Realistic**: No duplicate passenger-ride pairs

### Messages (200)
- **Conversations**: Between passengers and drivers
- **Content**: Common questions and responses
- **Read status**: ~70% marked as read
- **Quick messages**: ~30% are quick messages

### Ratings (120)
- **Source**: From confirmed bookings only
- **Stars**: Mostly 4-5 stars (realistic distribution)
- **Comments**: Mix of comments and rating-only
- **Visibility**: All visible

---

## Clearing Data

The seed script automatically clears old test data before creating new data.

**To manually clear all test data:**

Go to Supabase SQL Editor and run:

```sql
-- Delete in order of dependencies
DELETE FROM ratings WHERE id IS NOT NULL;
DELETE FROM messages WHERE id IS NOT NULL;
DELETE FROM bookings WHERE id IS NOT NULL;
DELETE FROM rides WHERE id IS NOT NULL;
DELETE FROM users WHERE email LIKE '%@albaniarides.test';
```

---

## Running Seed Again

You can run the seed script multiple times:

```bash
node scripts/seed.js
```

Each run will:
1. Clear previous test data
2. Create fresh data with different randomization
3. Generate new IDs and timestamps

---

## Troubleshooting

### "Missing Supabase credentials"
- Make sure `.env.local` exists in project root
- Verify all 3 environment variables are set
- Check for typos in variable names

### "Error creating users"
- Migration 004 must be run first (adds `email` column)
- Check Supabase logs for specific error
- Verify `users` table exists

### "No drivers found, skipping rides"
- Re-run the script (randomization might create 0 drivers)
- Or increase driver probability in `seedUsers()` function

### Fewer items than expected
- This is normal due to:
  - Duplicate prevention (same passenger can't book same ride twice)
  - Foreign key constraints
  - Randomization
- Total counts will vary slightly each run

### Permission errors
- Make sure you're using `SUPABASE_SERVICE_KEY` (not anon key)
- Service role key has full database access

---

## Safety Notes

⚠️ **Never commit `.env.local` to git**
- File is already in `.gitignore`
- Contains sensitive API keys

⚠️ **Don't use service role key in frontend**
- Only use in server-side scripts
- Never expose in client code

✅ **Test data is safe to delete**
- All test emails use `@albaniarides.test`
- No real user data is affected

---

## Next Steps

After seeding:

1. Test the UI with realistic data load
2. Check performance of search/filtering
3. Verify pagination works
4. Test booking flow with multiple rides
5. Check mobile responsiveness with full listings

---

## Customizing Seed Data

Edit `scripts/seed.js` to adjust:

- Number of users: `seedUsers(50)` → change 50
- Number of rides: `seedRides(users, 100)` → change 100
- Number of bookings: `seedBookings(users, rides, 150)` → change 150
- Driver percentage: `randomBool(0.4)` → change 0.4 to 0.5 (50%)
- Rating distribution: `randomInt(4, 5)` → change to `randomInt(3, 5)`

---

**Questions?** Check the script output for specific error messages.