-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_routes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select ON users
  FOR SELECT USING (true);

CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY users_update ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Rides policies
CREATE POLICY rides_select ON rides
  FOR SELECT USING (status = 'active' OR driver_id::text = auth.uid()::text);

CREATE POLICY rides_insert ON rides
  FOR INSERT WITH CHECK (auth.uid()::text = driver_id::text);

CREATE POLICY rides_update ON rides
  FOR UPDATE USING (auth.uid()::text = driver_id::text);

-- Bookings policies
CREATE POLICY bookings_select ON bookings
  FOR SELECT USING (
    auth.uid()::text = passenger_id::text OR
    auth.uid()::text IN (
      SELECT driver_id::text FROM rides WHERE id = bookings.ride_id
    )
  );

CREATE POLICY bookings_insert ON bookings
  FOR INSERT WITH CHECK (auth.uid()::text = passenger_id::text);

CREATE POLICY bookings_update ON bookings
  FOR UPDATE USING (
    auth.uid()::text = passenger_id::text OR
    auth.uid()::text IN (
      SELECT driver_id::text FROM rides WHERE id = bookings.ride_id
    )
  );

-- Ratings policies
CREATE POLICY ratings_select ON ratings
  FOR SELECT USING (
    is_visible = true OR
    rater_id::text = auth.uid()::text
  );

CREATE POLICY ratings_insert ON ratings
  FOR INSERT WITH CHECK (auth.uid()::text = rater_id::text);

-- Messages policies
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    auth.uid()::text IN (sender_id::text, receiver_id::text)
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id::text
  );

-- Cities and routes are public read
CREATE POLICY cities_select ON cities
  FOR SELECT USING (true);

CREATE POLICY city_routes_select ON city_routes
  FOR SELECT USING (true);