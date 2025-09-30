-- Insert Albanian cities
INSERT INTO cities (code, name, name_sq, latitude, longitude, region, population, is_major) VALUES
('TIA', 'Tirana', 'Tiranë', 41.3275, 19.8189, 'Central', 557422, true),
('DUR', 'Durrës', 'Durrës', 41.3246, 19.4565, 'Central', 175110, true),
('VLO', 'Vlorë', 'Vlorë', 40.4660, 19.4914, 'South', 130827, true),
('SHK', 'Shkodër', 'Shkodër', 42.0683, 19.5126, 'North', 135612, true),
('ELB', 'Elbasan', 'Elbasan', 41.1125, 20.0822, 'Central', 141714, true),
('FIE', 'Fier', 'Fier', 40.7239, 19.5569, 'South', 120655, true),
('KOR', 'Korçë', 'Korçë', 40.6186, 20.7808, 'Southeast', 75994, true),
('BER', 'Berat', 'Berat', 40.7058, 19.9522, 'Central', 60031, false),
('LUS', 'Lushnjë', 'Lushnjë', 40.9419, 19.7050, 'Central', 41469, false),
('KAV', 'Kavajë', 'Kavajë', 41.1855, 19.5569, 'Central', 40094, false),
('POG', 'Pogradec', 'Pogradec', 40.9025, 20.6497, 'Southeast', 20848, false),
('GJI', 'Gjirokastër', 'Gjirokastër', 40.0758, 20.1389, 'South', 19836, false),
('SAR', 'Sarandë', 'Sarandë', 39.8756, 20.0047, 'South', 20227, false),
('LAC', 'Laç', 'Laç', 41.6356, 19.7131, 'North', 17086, false),
('KUK', 'Kukës', 'Kukës', 42.0769, 20.4219, 'North', 16719, false);

-- Insert popular city routes with distances and durations
INSERT INTO city_routes (id, origin_code, destination_code, distance_km, typical_duration_min, toll_roads, popular_pickups) VALUES
('TIA_DUR', 'TIA', 'DUR', 39, 40, false, ARRAY['Skanderbeg Square', 'Zogu i Zi Roundabout', 'TEG Shopping Center']),
('DUR_TIA', 'DUR', 'TIA', 39, 40, false, ARRAY['Port of Durrës', 'Train Station', 'Beach Road']),
('TIA_VLO', 'TIA', 'VLO', 147, 150, false, ARRAY['Skanderbeg Square', 'South Bus Terminal', 'Tirana East Gate']),
('VLO_TIA', 'VLO', 'TIA', 147, 150, false, ARRAY['Independence Square', 'Vlora Port', 'Beach Hotels']),
('TIA_SHK', 'TIA', 'SHK', 116, 120, false, ARRAY['Skanderbeg Square', 'North Terminal', 'Kamza Junction']),
('SHK_TIA', 'SHK', 'TIA', 116, 120, false, ARRAY['Rozafa Castle Area', 'City Center', 'Democracy Square']),
('TIA_ELB', 'TIA', 'ELB', 45, 50, false, ARRAY['Skanderbeg Square', 'East Terminal', 'TEG Shopping']),
('ELB_TIA', 'ELB', 'TIA', 45, 50, false, ARRAY['Castle Area', 'University Campus', 'City Park']),
('TIA_FIE', 'TIA', 'FIE', 113, 110, false, ARRAY['Skanderbeg Square', 'South Terminal', 'Kombinat']),
('FIE_TIA', 'FIE', 'TIA', 113, 110, false, ARRAY['City Center', 'Apollonia Junction', 'Industrial Zone']),
('TIA_KOR', 'TIA', 'KOR', 179, 180, false, ARRAY['Skanderbeg Square', 'East Terminal', 'Sauk Junction']),
('KOR_TIA', 'KOR', 'TIA', 179, 180, false, ARRAY['Cathedral', 'Old Bazaar', 'Morava Junction']),
('TIA_BER', 'TIA', 'BER', 122, 120, false, ARRAY['Skanderbeg Square', 'South Terminal', 'Kashar Junction']),
('BER_TIA', 'BER', 'TIA', 122, 120, false, ARRAY['Castle Quarter', 'Mangalem', 'City Stadium']),
('DUR_VLO', 'DUR', 'VLO', 118, 120, false, ARRAY['Port Area', 'Plepa Junction', 'Beach Road']),
('VLO_DUR', 'VLO', 'DUR', 118, 120, false, ARRAY['Independence Square', 'Novoselë Junction', 'Cold Water']),
('SHK_DUR', 'SHK', 'DUR', 85, 90, false, ARRAY['City Center', 'Lezha Junction', 'Milot Roundabout']),
('DUR_SHK', 'DUR', 'SHK', 85, 90, false, ARRAY['Train Station', 'Shkozet', 'Fushe Kruje Junction']);

-- Create a materialized view for ride search
CREATE MATERIALIZED VIEW IF NOT EXISTS ride_search AS
SELECT
  r.id,
  r.origin_city,
  r.destination_city,
  r.departure_time,
  r.price_per_seat,
  r.seats_available,
  r.pickup_point,
  r.luggage_space,
  r.smoking_allowed,
  u.id as driver_id,
  u.name as driver_name,
  u.photo_url as driver_photo,
  u.rating as driver_rating,
  u.total_rides
FROM rides r
JOIN users u ON r.driver_id = u.id
WHERE r.status = 'active'
  AND r.departure_time > NOW()
  AND r.seats_available > 0;

-- Create indexes for the materialized view
CREATE INDEX idx_ride_search_route ON ride_search(origin_city, destination_city, departure_time);
CREATE INDEX idx_ride_search_departure ON ride_search(departure_time);

-- Test users for development (phone numbers are encrypted with test key)
-- Note: In production, you'll need to register users through the app
-- These are example entries using placeholder encrypted values
INSERT INTO users (id, phone_number_encrypted, phone_hash, name, city, is_driver, car_model, car_color, rating, total_rides, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'encrypted_phone_1', 'hash_355691234567', 'Alban Berisha', 'TIA', true, 'Mercedes-Benz E-Class', 'Silver', 4.8, 127, NOW() - INTERVAL '6 months'),
('550e8400-e29b-41d4-a716-446655440002', 'encrypted_phone_2', 'hash_355691234568', 'Erjon Hoxha', 'DUR', true, 'BMW 5 Series', 'Black', 4.9, 203, NOW() - INTERVAL '1 year'),
('550e8400-e29b-41d4-a716-446655440003', 'encrypted_phone_3', 'hash_355691234569', 'Mirela Krasniqi', 'VLO', true, 'Audi A6', 'White', 4.7, 89, NOW() - INTERVAL '4 months'),
('550e8400-e29b-41d4-a716-446655440004', 'encrypted_phone_4', 'hash_355691234570', 'Fjola Dervishi', 'SHK', true, 'Toyota Camry', 'Blue', 5.0, 156, NOW() - INTERVAL '8 months'),
('550e8400-e29b-41d4-a716-446655440005', 'encrypted_phone_5', 'hash_355691234571', 'Klodian Gjoka', 'TIA', true, 'Volkswagen Passat', 'Grey', 4.6, 74, NOW() - INTERVAL '3 months');

-- Test rides for development
-- Create rides for popular routes starting from tomorrow
INSERT INTO rides (id, driver_id, origin_city, destination_city, departure_time, pickup_point, seats_total, seats_available, price_per_seat, luggage_space, smoking_allowed, is_recurring, status, created_at) VALUES
-- Tirana to Durrës (tomorrow morning)
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TIA', 'DUR', (CURRENT_DATE + INTERVAL '1 day') + TIME '08:00:00', 'Skanderbeg Square', 3, 3, 500, true, false, false, 'active', NOW()),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'TIA', 'DUR', (CURRENT_DATE + INTERVAL '1 day') + TIME '14:30:00', 'TEG Shopping Center', 4, 2, 450, true, false, false, 'active', NOW()),

-- Durrës to Tirana (tomorrow afternoon)
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'DUR', 'TIA', (CURRENT_DATE + INTERVAL '1 day') + TIME '16:00:00', 'Port of Durrës', 3, 3, 500, false, false, false, 'active', NOW()),

-- Tirana to Vlorë (tomorrow morning)
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'TIA', 'VLO', (CURRENT_DATE + INTERVAL '1 day') + TIME '09:00:00', 'South Bus Terminal', 3, 1, 1500, true, false, false, 'active', NOW()),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'TIA', 'VLO', (CURRENT_DATE + INTERVAL '1 day') + TIME '15:00:00', 'Skanderbeg Square', 4, 4, 1400, true, true, false, 'active', NOW()),

-- Vlorë to Tirana (day after tomorrow)
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'VLO', 'TIA', (CURRENT_DATE + INTERVAL '2 days') + TIME '10:00:00', 'Independence Square', 3, 3, 1500, true, false, false, 'active', NOW()),

-- Tirana to Shkodër (tomorrow morning)
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'TIA', 'SHK', (CURRENT_DATE + INTERVAL '1 day') + TIME '07:30:00', 'North Terminal', 4, 4, 1000, true, false, false, 'active', NOW()),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'TIA', 'SHK', (CURRENT_DATE + INTERVAL '1 day') + TIME '17:00:00', 'Kamza Junction', 3, 2, 1100, false, false, false, 'active', NOW()),

-- Shkodër to Tirana (tomorrow afternoon)
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'SHK', 'TIA', (CURRENT_DATE + INTERVAL '1 day') + TIME '15:30:00', 'Rozafa Castle Area', 4, 3, 1000, true, false, false, 'active', NOW()),

-- Tirana to Elbasan (tomorrow)
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'TIA', 'ELB', (CURRENT_DATE + INTERVAL '1 day') + TIME '11:00:00', 'East Terminal', 4, 4, 600, true, false, false, 'active', NOW()),

-- Durrës to Vlorë (day after tomorrow)
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'DUR', 'VLO', (CURRENT_DATE + INTERVAL '2 days') + TIME '09:30:00', 'Beach Road', 3, 3, 1200, true, false, false, 'active', NOW()),

-- Tirana to Korçë (day after tomorrow)
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'TIA', 'KOR', (CURRENT_DATE + INTERVAL '2 days') + TIME '08:00:00', 'Skanderbeg Square', 3, 3, 1800, true, false, false, 'active', NOW());

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW ride_search;