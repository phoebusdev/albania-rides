-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number_encrypted TEXT NOT NULL,
  phone_hash TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
  photo_url TEXT,
  city TEXT NOT NULL,
  bio TEXT CHECK (length(bio) <= 500),

  -- Driver fields
  is_driver BOOLEAN DEFAULT false,
  car_model TEXT,
  car_color TEXT,
  driving_years INTEGER CHECK (driving_years >= 0),

  -- Computed fields
  rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating BETWEEN 1.0 AND 5.0),
  total_rides INTEGER DEFAULT 0,
  member_since TIMESTAMPTZ DEFAULT NOW(),

  -- Auth & status
  verified_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities table
CREATE TABLE cities (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_sq TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  region TEXT,
  population INTEGER,
  is_major BOOLEAN DEFAULT false
);

-- City routes table
CREATE TABLE city_routes (
  id TEXT PRIMARY KEY,
  origin_code TEXT REFERENCES cities(code),
  destination_code TEXT REFERENCES cities(code),
  distance_km INTEGER NOT NULL,
  typical_duration_min INTEGER NOT NULL,
  toll_roads BOOLEAN DEFAULT false,
  popular_pickups TEXT[]
);

-- Rides table
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES users(id) NOT NULL,

  -- Route
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  stops TEXT[],
  pickup_point TEXT NOT NULL,

  -- Schedule
  departure_time TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER,

  -- Capacity & pricing
  seats_total INTEGER NOT NULL CHECK (seats_total BETWEEN 1 AND 4),
  seats_available INTEGER CHECK (seats_available <= seats_total),
  price_per_seat DECIMAL(10, 2) NOT NULL CHECK (price_per_seat > 0),

  -- Preferences
  luggage_space BOOLEAN DEFAULT false,
  smoking_allowed BOOLEAN DEFAULT false,

  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', NULL)),
  recurrence_end_date TIMESTAMPTZ,
  parent_ride_id UUID REFERENCES rides(id),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_cities CHECK (origin_city != destination_city),
  CONSTRAINT future_departure CHECK (departure_time > NOW())
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES rides(id) NOT NULL,
  passenger_id UUID REFERENCES users(id) NOT NULL,

  -- Details
  seats_booked INTEGER NOT NULL CHECK (seats_booked BETWEEN 1 AND 4),
  total_price DECIMAL(10, 2) NOT NULL,
  pickup_point TEXT NOT NULL,
  passenger_message TEXT CHECK (length(passenger_message) <= 500),

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT CHECK (cancelled_by IN ('passenger', 'driver', 'system', NULL)),
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,

  -- SMS tracking
  sms_sent_at TIMESTAMPTZ,
  sms_delivery_status TEXT CHECK (sms_delivery_status IN ('pending', 'delivered', 'failed', NULL)),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_passenger_ride UNIQUE (ride_id, passenger_id)
);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES rides(id) NOT NULL,
  booking_id UUID REFERENCES bookings(id) NOT NULL,

  -- Who rates whom
  rater_id UUID REFERENCES users(id) NOT NULL,
  rated_id UUID REFERENCES users(id) NOT NULL,
  rater_type TEXT NOT NULL CHECK (rater_type IN ('driver', 'passenger')),

  -- Rating
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT CHECK (length(comment) <= 500),

  -- Visibility
  is_visible BOOLEAN DEFAULT false,
  visibility_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_rating UNIQUE (ride_id, rater_id),
  CONSTRAINT different_users CHECK (rater_id != rated_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id) NOT NULL,

  -- Content
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  is_quick_message BOOLEAN DEFAULT false,

  -- Status
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_sender_receiver CHECK (sender_id != receiver_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();