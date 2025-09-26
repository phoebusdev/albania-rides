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