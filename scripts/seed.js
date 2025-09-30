/**
 * Seed script for AlbaniaRides
 * Creates realistic test data: users, rides, bookings, messages, ratings
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Albanian names
const FIRST_NAMES_MALE = ['Andi', 'Erion', 'Ilir', 'Arben', 'Agron', 'Besnik', 'Dritan', 'Endri', 'Flamur', 'Genti'];
const FIRST_NAMES_FEMALE = ['Ana', 'Elira', 'Dorina', 'Alma', 'Besa', 'Diana', 'Erjona', 'Floriana', 'Gentiana', 'Hjona'];
const LAST_NAMES = ['Hoxha', 'Shehu', 'Kola', 'Meta', 'Berisha', 'Leka', 'Gjoni', 'Marku', 'Dervishi', 'Çela', 'Tola', 'Kurti'];

// Albanian cities
const CITIES = [
  { code: 'TIA', name: 'Tirana' },
  { code: 'DUR', name: 'Durrës' },
  { code: 'VLO', name: 'Vlorë' },
  { code: 'SHK', name: 'Shkodër' },
  { code: 'ELB', name: 'Elbasan' },
  { code: 'FIE', name: 'Fier' },
  { code: 'KOR', name: 'Korçë' },
  { code: 'BER', name: 'Berat' },
  { code: 'LUS', name: 'Lushnjë' },
  { code: 'KAV', name: 'Kavajë' },
  { code: 'POG', name: 'Pogradec' },
  { code: 'GJI', name: 'Gjirokastër' },
  { code: 'SAR', name: 'Sarandë' },
  { code: 'LAC', name: 'Laç' },
  { code: 'KUK', name: 'Kukës' }
];

// Popular routes
const POPULAR_ROUTES = [
  { from: 'TIA', to: 'DUR', price: 500, duration: 40 },
  { from: 'TIA', to: 'VLO', price: 1500, duration: 150 },
  { from: 'TIA', to: 'SHK', price: 1200, duration: 120 },
  { from: 'TIA', to: 'ELB', price: 600, duration: 50 },
  { from: 'TIA', to: 'KOR', price: 1800, duration: 180 },
  { from: 'DUR', to: 'VLO', price: 1200, duration: 120 },
  { from: 'DUR', to: 'SHK', price: 1000, duration: 100 },
  { from: 'VLO', to: 'SAR', price: 1000, duration: 90 },
  { from: 'SHK', to: 'KUK', price: 800, duration: 80 },
  { from: 'ELB', to: 'KOR', price: 1200, duration: 120 }
];

// Car models
const CAR_MODELS = [
  'Mercedes E-Class', 'BMW 5 Series', 'Audi A4', 'VW Passat', 'Toyota Camry',
  'Honda Accord', 'Ford Mondeo', 'Nissan Maxima', 'Hyundai Sonata', 'Mazda 6',
  'VW Golf', 'Opel Astra', 'Fiat Punto', 'Renault Megane', 'Peugeot 308'
];

const CAR_COLORS = ['White', 'Black', 'Silver', 'Blue', 'Red', 'Gray', 'Green'];

// Utilities
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomBool = (probability = 0.5) => Math.random() < probability;

function generateName() {
  const isMale = randomBool();
  const firstName = random(isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
  const lastName = random(LAST_NAMES);
  return `${firstName} ${lastName}`;
}

function generateEmail(name) {
  const cleaned = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleaned}${randomInt(1, 999)}@albaniarides.test`;
}

function getRandomDate(daysAhead = 7) {
  const now = new Date();
  const daysOffset = randomInt(0, daysAhead);
  const hoursOffset = randomInt(6, 22);
  const date = new Date(now);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hoursOffset, randomInt(0, 59), 0, 0);
  return date.toISOString();
}

function getPastDate(daysBack = 30) {
  const now = new Date();
  const daysOffset = randomInt(1, daysBack);
  const date = new Date(now);
  date.setDate(date.getDate() - daysOffset);
  return date.toISOString();
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing test data...');

  // Delete in order of foreign key dependencies
  await supabase.from('ratings').delete().like('id', '%');
  await supabase.from('messages').delete().like('id', '%');
  await supabase.from('bookings').delete().like('id', '%');
  await supabase.from('rides').delete().like('id', '%');
  await supabase.from('users').delete().like('email', '%@albaniarides.test');

  console.log('✅ Cleared existing data\n');
}

async function seedUsers(count = 50) {
  console.log(`👥 Creating ${count} users...`);

  const users = [];

  for (let i = 0; i < count; i++) {
    const name = generateName();
    const email = generateEmail(name);
    const city = random(CITIES).code;
    const isDriver = randomBool(0.4); // 40% are drivers

    const user = {
      email,
      name,
      city,
      is_driver: isDriver,
      rating: parseFloat((4.0 + Math.random()).toFixed(1)),
      total_rides: randomInt(0, 50),
      member_since: getPastDate(365),
      auth_method: 'email',
      auth_provider: 'email'
    };

    if (isDriver) {
      user.car_model = random(CAR_MODELS);
      user.car_color = random(CAR_COLORS);
      user.driving_years = randomInt(1, 20);
    }

    users.push(user);
  }

  const { data, error } = await supabase.from('users').insert(users).select();

  if (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }

  console.log(`✅ Created ${data.length} users\n`);
  return data;
}

async function seedRides(users, count = 100) {
  console.log(`🚗 Creating ${count} rides...`);

  const drivers = users.filter(u => u.is_driver);
  if (drivers.length === 0) {
    console.log('⚠️  No drivers found, skipping rides');
    return [];
  }

  const rides = [];

  for (let i = 0; i < count; i++) {
    const driver = random(drivers);
    const route = random(POPULAR_ROUTES);
    const departureTime = getRandomDate(14);
    const seats = randomInt(1, 3);

    const ride = {
      driver_id: driver.id,
      origin_city: route.from,
      destination_city: route.to,
      pickup_point: `${random(CITIES.find(c => c.code === route.from)?.name)} Central`,
      departure_time: departureTime,
      estimated_duration: route.duration,
      seats_total: seats,
      seats_available: seats,
      price_per_seat: route.price + randomInt(-200, 200),
      luggage_space: randomBool(0.7),
      smoking_allowed: randomBool(0.2),
      status: 'active'
    };

    rides.push(ride);
  }

  const { data, error } = await supabase.from('rides').insert(rides).select();

  if (error) {
    console.error('❌ Error creating rides:', error);
    throw error;
  }

  console.log(`✅ Created ${data.length} rides\n`);
  return data;
}

async function seedBookings(users, rides, count = 150) {
  console.log(`📝 Creating ${count} bookings...`);

  const passengers = users;
  if (passengers.length === 0 || rides.length === 0) {
    console.log('⚠️  No users or rides found, skipping bookings');
    return [];
  }

  const bookings = [];
  const usedPairs = new Set(); // Track rider-ride pairs to avoid duplicates

  for (let i = 0; i < count; i++) {
    const ride = random(rides);
    const passenger = random(passengers.filter(p => p.id !== ride.driver_id));

    if (!passenger) continue;

    const pairKey = `${passenger.id}-${ride.id}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    const seatsBooked = randomInt(1, Math.min(2, ride.seats_available));
    const status = randomBool(0.9) ? 'confirmed' : 'cancelled';

    const booking = {
      ride_id: ride.id,
      passenger_id: passenger.id,
      seats_booked: seatsBooked,
      total_price: ride.price_per_seat * seatsBooked,
      pickup_point: ride.pickup_point,
      status,
      confirmed_at: new Date().toISOString()
    };

    if (status === 'cancelled') {
      booking.cancelled_at = new Date().toISOString();
      booking.cancelled_by = randomBool() ? 'passenger' : 'driver';
      booking.cancellation_reason = 'Schedule changed';
    }

    bookings.push(booking);
  }

  const { data, error } = await supabase.from('bookings').insert(bookings).select();

  if (error) {
    console.error('❌ Error creating bookings:', error);
    throw error;
  }

  console.log(`✅ Created ${data.length} bookings\n`);
  return data;
}

async function seedMessages(bookings, users, count = 200) {
  console.log(`💬 Creating ${count} messages...`);

  if (bookings.length === 0) {
    console.log('⚠️  No bookings found, skipping messages');
    return [];
  }

  const messageTemplates = [
    "Hi, what time are we leaving?",
    "I'll be there in 5 minutes",
    "Can you wait for me? Running a bit late",
    "Where exactly is the pickup point?",
    "Thanks for the ride!",
    "See you tomorrow",
    "Can I bring extra luggage?",
    "How's the weather there?",
    "Do you have AC in the car?",
    "Can we make a quick stop?"
  ];

  const messages = [];
  const usedBookings = new Set();

  for (let i = 0; i < count && usedBookings.size < bookings.length; i++) {
    const booking = random(bookings);

    // Get ride details to find driver
    const { data: ride } = await supabase
      .from('rides')
      .select('driver_id')
      .eq('id', booking.ride_id)
      .single();

    if (!ride) continue;

    const isPassengerSending = randomBool();

    const message = {
      booking_id: booking.id,
      sender_id: isPassengerSending ? booking.passenger_id : ride.driver_id,
      receiver_id: isPassengerSending ? ride.driver_id : booking.passenger_id,
      content: random(messageTemplates),
      is_quick_message: randomBool(0.3),
      read_at: randomBool(0.7) ? new Date().toISOString() : null
    };

    messages.push(message);

    if (randomBool(0.6)) { // 60% chance of conversation
      usedBookings.add(booking.id);
    }
  }

  const { data, error } = await supabase.from('messages').insert(messages).select();

  if (error) {
    console.error('❌ Error creating messages:', error);
    throw error;
  }

  console.log(`✅ Created ${data.length} messages\n`);
  return data;
}

async function seedRatings(bookings, count = 120) {
  console.log(`⭐ Creating ${count} ratings...`);

  if (bookings.length === 0) {
    console.log('⚠️  No bookings found, skipping ratings');
    return [];
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  if (confirmedBookings.length === 0) {
    console.log('⚠️  No confirmed bookings found, skipping ratings');
    return [];
  }

  const comments = [
    "Great driver, very punctual!",
    "Nice car, comfortable ride",
    "Friendly and professional",
    "Smooth ride, would recommend",
    "Good conversation, safe driving",
    "Clean car, pleasant journey",
    "On time and courteous",
    "Excellent service",
    "Very helpful and kind",
    null, null, null // Some ratings without comments
  ];

  const ratings = [];
  const ratedBookings = new Set();

  for (let i = 0; i < Math.min(count, confirmedBookings.length); i++) {
    const booking = confirmedBookings[i];

    if (ratedBookings.has(booking.id)) continue;
    ratedBookings.add(booking.id);

    // Get ride details
    const { data: ride } = await supabase
      .from('rides')
      .select('driver_id')
      .eq('id', booking.ride_id)
      .single();

    if (!ride) continue;

    const rating = {
      ride_id: booking.ride_id,
      booking_id: booking.id,
      rater_id: booking.passenger_id,
      rated_id: ride.driver_id,
      rater_type: 'passenger',
      stars: randomInt(4, 5), // Mostly positive ratings
      comment: random(comments),
      is_visible: true,
      visibility_date: new Date().toISOString()
    };

    ratings.push(rating);
  }

  const { data, error } = await supabase.from('ratings').insert(ratings).select();

  if (error) {
    console.error('❌ Error creating ratings:', error);
    throw error;
  }

  console.log(`✅ Created ${data.length} ratings\n`);
  return data;
}

async function main() {
  console.log('🌱 Starting seed script for AlbaniaRides...\n');

  try {
    await clearExistingData();

    const users = await seedUsers(50);
    const rides = await seedRides(users, 100);
    const bookings = await seedBookings(users, rides, 150);
    const messages = await seedMessages(bookings, users, 200);
    const ratings = await seedRatings(bookings, 120);

    console.log('✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Rides: ${rides.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Messages: ${messages.length}`);
    console.log(`   Ratings: ${ratings.length}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();