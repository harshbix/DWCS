-- EcoCollect Tanzania — Seed Reference Data
-- Seed file for local Supabase environments

-- 1. SEED DEFAULT ORGANIZATIONS
INSERT INTO public.organizations (id, name, region, logo_url, active)
VALUES (
  'de1f4b88-1234-5678-abcd-ef0123456789'::uuid,
  'Dar es Salaam Waste Management Authority',
  'Dar es Salaam',
  'https://images.unsplash.com/photo-1599305445671-ac291c95aba9',
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. SEED SYSTEM USER ROLES
INSERT INTO public.roles (id, name, description)
VALUES 
  ('c3b3f2a5-9988-7766-5544-33221100aa01'::uuid, 'citizen'::public.user_role, 'Resident of the municipality who submits complaints and processes payments'),
  ('c3b3f2a5-9988-7766-5544-33221100aa02'::uuid, 'driver'::public.user_role, 'Collector driving waste trucks and completing schedules'),
  ('c3b3f2a5-9988-7766-5544-33221100aa03'::uuid, 'supervisor'::public.user_role, 'Municipality inspector auditing zone metrics, logs, and routes'),
  ('c3b3f2a5-9988-7766-5544-33221100aa04'::uuid, 'admin'::public.user_role, 'System administrator with full administrative access')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED GEOGRAPHICAL REGIONS
INSERT INTO public.regions (id, name)
VALUES ('7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Dar es Salaam')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED DISTRICTS
INSERT INTO public.districts (id, region_id, name)
VALUES 
  ('7b12d5e2-0002-4444-8888-abcdef000011'::uuid, '7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Ilala'),
  ('7b12d5e2-0002-4444-8888-abcdef000012'::uuid, '7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Kinondoni'),
  ('7b12d5e2-0002-4444-8888-abcdef000013'::uuid, '7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Temeke')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED WARDS
INSERT INTO public.wards (id, district_id, name)
VALUES 
  -- Ilala Wards
  ('7b12d5e2-0003-4444-8888-abcdef000101'::uuid, '7b12d5e2-0002-4444-8888-abcdef000011'::uuid, 'Kariakoo'),
  ('7b12d5e2-0003-4444-8888-abcdef000102'::uuid, '7b12d5e2-0002-4444-8888-abcdef000011'::uuid, 'Upanga West'),
  ('7b12d5e2-0003-4444-8888-abcdef000103'::uuid, '7b12d5e2-0002-4444-8888-abcdef000011'::uuid, 'Tabata'),
  -- Kinondoni Wards
  ('7b12d5e2-0003-4444-8888-abcdef000201'::uuid, '7b12d5e2-0002-4444-8888-abcdef000012'::uuid, 'Msasani'),
  ('7b12d5e2-0003-4444-8888-abcdef000202'::uuid, '7b12d5e2-0002-4444-8888-abcdef000012'::uuid, 'Kawe'),
  ('7b12d5e2-0003-4444-8888-abcdef000203'::uuid, '7b12d5e2-0002-4444-8888-abcdef000012'::uuid, 'Mikocheni'),
  -- Temeke Wards
  ('7b12d5e2-0003-4444-8888-abcdef000301'::uuid, '7b12d5e2-0002-4444-8888-abcdef000013'::uuid, 'Kigamboni'),
  ('7b12d5e2-0003-4444-8888-abcdef000302'::uuid, '7b12d5e2-0002-4444-8888-abcdef000013'::uuid, 'Mbagala'),
  ('7b12d5e2-0003-4444-8888-abcdef000303'::uuid, '7b12d5e2-0002-4444-8888-abcdef000013'::uuid, 'Changombe'),
  ('7b12d5e2-0003-4444-8888-abcdef000304'::uuid, '7b12d5e2-0002-4444-8888-abcdef000013'::uuid, 'Kurasini')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED STREETS (2 per ward = 20 streets)
INSERT INTO public.streets (id, ward_id, name)
VALUES 
  -- Kariakoo Streets
  ('7b12d5e2-0004-4444-8888-abcdef001001'::uuid, '7b12d5e2-0003-4444-8888-abcdef000101'::uuid, 'Msimbazi Street'),
  ('7b12d5e2-0004-4444-8888-abcdef001002'::uuid, '7b12d5e2-0003-4444-8888-abcdef000101'::uuid, 'Congo Street'),
  -- Upanga West Streets
  ('7b12d5e2-0004-4444-8888-abcdef001003'::uuid, '7b12d5e2-0003-4444-8888-abcdef000102'::uuid, 'Chakula Street'),
  ('7b12d5e2-0004-4444-8888-abcdef001004'::uuid, '7b12d5e2-0003-4444-8888-abcdef000102'::uuid, 'Upanga Road'),
  -- Tabata Streets
  ('7b12d5e2-0004-4444-8888-abcdef001005'::uuid, '7b12d5e2-0003-4444-8888-abcdef000103'::uuid, 'Tabata Dampo Street'),
  ('7b12d5e2-0004-4444-8888-abcdef001006'::uuid, '7b12d5e2-0003-4444-8888-abcdef000103'::uuid, 'Bima Street'),
  -- Msasani Streets
  ('7b12d5e2-0004-4444-8888-abcdef001007'::uuid, '7b12d5e2-0003-4444-8888-abcdef000201'::uuid, 'Kimweri Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001008'::uuid, '7b12d5e2-0003-4444-8888-abcdef000201'::uuid, 'Chole Road'),
  -- Kawe Streets
  ('7b12d5e2-0004-4444-8888-abcdef001009'::uuid, '7b12d5e2-0003-4444-8888-abcdef000202'::uuid, 'Mwai Kibaki Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001010'::uuid, '7b12d5e2-0003-4444-8888-abcdef000202'::uuid, 'Kawe Beach Road'),
  -- Mikocheni Streets
  ('7b12d5e2-0004-4444-8888-abcdef001011'::uuid, '7b12d5e2-0003-4444-8888-abcdef000203'::uuid, 'Coca Cola Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001012'::uuid, '7b12d5e2-0003-4444-8888-abcdef000203'::uuid, 'Old Bagamoyo Road'),
  -- Kigamboni Streets
  ('7b12d5e2-0004-4444-8888-abcdef001013'::uuid, '7b12d5e2-0003-4444-8888-abcdef000301'::uuid, 'Ferry Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001014'::uuid, '7b12d5e2-0003-4444-8888-abcdef000301'::uuid, 'Tundwi Songani Road'),
  -- Mbagala Streets
  ('7b12d5e2-0004-4444-8888-abcdef001015'::uuid, '7b12d5e2-0003-4444-8888-abcdef000302'::uuid, 'Kilwa Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001016'::uuid, '7b12d5e2-0003-4444-8888-abcdef000302'::uuid, 'Kuu Street'),
  -- Changombe Streets
  ('7b12d5e2-0004-4444-8888-abcdef001017'::uuid, '7b12d5e2-0003-4444-8888-abcdef000303'::uuid, 'Changombe Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001018'::uuid, '7b12d5e2-0003-4444-8888-abcdef000303'::uuid, 'Temeke Road'),
  -- Kurasini Streets
  ('7b12d5e2-0004-4444-8888-abcdef001019'::uuid, '7b12d5e2-0003-4444-8888-abcdef000304'::uuid, 'Harbour View Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001020'::uuid, '7b12d5e2-0003-4444-8888-abcdef000304'::uuid, 'Bandari Road')
ON CONFLICT (id) DO NOTHING;

-- 7. SEED COLLECTION STOPS (5 per street = 100 stops)
-- We insert stops dynamically in a loop or with static coordinates. Using static inserts:
DO $$
DECLARE
  street_rec record;
  i integer;
  stop_lat numeric;
  stop_lng numeric;
BEGIN
  FOR street_rec IN SELECT id, name FROM public.streets LOOP
    FOR i IN 1..5 LOOP
      -- Generate minor variations in Dar es Salaam GPS center (-6.7924, 39.2083)
      stop_lat := -6.7900 - (i * 0.005) - (random() * 0.002);
      stop_lng := 39.2000 + (i * 0.006) + (random() * 0.003);
      
      INSERT INTO public.collection_stops (name, street_id, latitude, longitude)
      VALUES (
        'CS-' || substring(street_rec.name from 1 for 4) || '-0' || i,
        street_rec.id,
        stop_lat,
        stop_lng
      );
    END LOOP;
  END LOOP;
END
$$;

-- 8. SEED MOCK VEHICLES
INSERT INTO public.vehicles (organization_id, plate_number, capacity_tons, status)
VALUES 
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 101 ABC', 8.5, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 102 DEF', 10.0, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 103 GHI', 12.0, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 104 JKL', 8.5, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 105 MNO', 10.0, 'maintenance'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 106 PQR', 12.0, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 107 STU', 8.5, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 108 VWX', 10.0, 'inactive'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 109 YZA', 12.0, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 110 BCD', 15.0, 'active'::public.vehicle_status)
ON CONFLICT (plate_number) DO NOTHING;

-- 9. SEED BASE COLLECTION ROUTES
INSERT INTO public.routes (id, organization_id, name, description)
VALUES 
  ('8c24f2b1-0001-4444-8888-abcdef000001'::uuid, 'de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'Ilala Core Route', 'Covers Msimbazi, Congo, and Upanga West key intersections'),
  ('8c24f2b1-0001-4444-8888-abcdef000002'::uuid, 'de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'Kinondoni Coastal Route', 'Covers Msasani Kimweri, Kawe beach roads'),
  ('8c24f2b1-0001-4444-8888-abcdef000003'::uuid, 'de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'Temeke Industrial Route', 'Covers Changombe and Temeke roads'),
  ('8c24f2b1-0001-4444-8888-abcdef000004'::uuid, 'de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'Kigamboni Loop', 'Covers Ferry Road and Tundwi Songani residential zones')
ON CONFLICT (id) DO NOTHING;

-- 10. SEED ROUTE STOPS SEQUENCING
-- Bind first 5 stops of Msimbazi street to Route 1
INSERT INTO public.route_stops (route_id, stop_id, sequence_order)
SELECT '8c24f2b1-0001-4444-8888-abcdef000001'::uuid, id, row_number() over()
FROM public.collection_stops
WHERE street_id = '7b12d5e2-0004-4444-8888-abcdef001001'::uuid
LIMIT 5
ON CONFLICT DO NOTHING;

-- Bind first 5 stops of Kimweri Road to Route 2
INSERT INTO public.route_stops (route_id, stop_id, sequence_order)
SELECT '8c24f2b1-0001-4444-8888-abcdef000002'::uuid, id, row_number() over()
FROM public.collection_stops
WHERE street_id = '7b12d5e2-0004-4444-8888-abcdef001007'::uuid
LIMIT 5
ON CONFLICT DO NOTHING;

-- Bind first 5 stops of Changombe Road to Route 3
INSERT INTO public.route_stops (route_id, stop_id, sequence_order)
SELECT '8c24f2b1-0001-4444-8888-abcdef000003'::uuid, id, row_number() over()
FROM public.collection_stops
WHERE street_id = '7b12d5e2-0004-4444-8888-abcdef001017'::uuid
LIMIT 5
ON CONFLICT DO NOTHING;

-- 11. SEED SYSTEM SETTINGS DEFAULTS
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('waste_volume_limit_tons', '{"value": 15.0}'::jsonb, 'Default maximum waste capacity threshold per collection segment'),
  ('payment_reminder_days', '{"days": 3}'::jsonb, 'Number of days before billing due date to dispatch notifications'),
  ('telemetry_ping_interval_seconds', '{"interval": 10}'::jsonb, 'Required GPS telemetry submission frequency for drivers'),
  ('alert_high_priority_threshold', '{"value": "critical"}'::jsonb, 'The threshold mapping to immediate supervisor dispatch triggers')
ON CONFLICT (key) DO NOTHING;
