-- Performance indexes for AlbaniaRides

-- Users table indexes
CREATE INDEX idx_users_phone_hash ON users(phone_hash);
CREATE INDEX idx_users_verified_at ON users(verified_at) WHERE verified_at IS NOT NULL;
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_is_driver ON users(is_driver) WHERE is_driver = true;

-- Rides table indexes
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_origin_destination ON rides(origin_city, destination_city);
CREATE INDEX idx_rides_departure_time ON rides(departure_time);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_seats_available ON rides(seats_available) WHERE seats_available > 0;
CREATE INDEX idx_rides_active_search ON rides(origin_city, destination_city, departure_time, status)
  WHERE status = 'active' AND seats_available > 0;

-- Bookings table indexes
CREATE INDEX idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Messages table indexes
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Ratings table indexes
CREATE INDEX idx_ratings_rated_id ON ratings(rated_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_ride_id ON ratings(ride_id);
CREATE UNIQUE INDEX idx_ratings_unique_per_ride ON ratings(ride_id, rater_id);

-- City routes indexes
CREATE INDEX idx_city_routes_origin ON city_routes(origin_code);
CREATE INDEX idx_city_routes_destination ON city_routes(destination_code);