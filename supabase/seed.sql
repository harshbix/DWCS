-- EcoCollect Tanzania — Seed Reference Data for Mbeya
-- Seed file for local Supabase environments

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SEED DEFAULT ORGANIZATIONS
INSERT INTO public.organizations (id, name, region, logo_url, active)
VALUES (
  'de1f4b88-1234-5678-abcd-ef0123456789'::uuid,
  'Mbeya Waste Management Authority',
  'Mbeya',
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
VALUES ('7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Mbeya')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED DISTRICTS
INSERT INTO public.districts (id, region_id, name)
VALUES 
  ('7b12d5e2-0002-4444-8888-abcdef000011'::uuid, '7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Mbeya Urban'),
  ('7b12d5e2-0002-4444-8888-abcdef000012'::uuid, '7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Mbeya Rural'),
  ('7b12d5e2-0002-4444-8888-abcdef000013'::uuid, '7b12d5e2-0001-4444-8888-abcdef000001'::uuid, 'Rungwe')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED WARDS
INSERT INTO public.wards (id, district_id, name)
VALUES 
  -- Mbeya Urban Wards
  ('7b12d5e2-0003-4444-8888-abcdef000101'::uuid, '7b12d5e2-0002-4444-8888-abcdef000011'::uuid, 'Sisimba'),
  ('7b12d5e2-0003-4444-8888-abcdef000102'::uuid, '7b12d5e2-0002-4444-8888-abcdef000011'::uuid, 'Ruanda'),
  ('7b12d5e2-0003-4444-8888-abcdef000103'::uuid, '7b12d5e2-0002-4444-8888-abcdef000011'::uuid, 'Iyela'),
  -- Mbeya Rural Wards
  ('7b12d5e2-0003-4444-8888-abcdef000201'::uuid, '7b12d5e2-0002-4444-8888-abcdef000012'::uuid, 'Inyala'),
  ('7b12d5e2-0003-4444-8888-abcdef000202'::uuid, '7b12d5e2-0002-4444-8888-abcdef000012'::uuid, 'Utengule'),
  -- Rungwe Wards
  ('7b12d5e2-0003-4444-8888-abcdef000301'::uuid, '7b12d5e2-0002-4444-8888-abcdef000013'::uuid, 'Tukuyu')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED STREETS
INSERT INTO public.streets (id, ward_id, name)
VALUES 
  -- Sisimba Streets
  ('7b12d5e2-0004-4444-8888-abcdef001001'::uuid, '7b12d5e2-0003-4444-8888-abcdef000101'::uuid, 'Sokoine Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001002'::uuid, '7b12d5e2-0003-4444-8888-abcdef000101'::uuid, 'Mwanjelwa Street'),
  -- Ruanda Streets
  ('7b12d5e2-0004-4444-8888-abcdef001003'::uuid, '7b12d5e2-0003-4444-8888-abcdef000102'::uuid, 'Kawetire Street'),
  ('7b12d5e2-0004-4444-8888-abcdef001004'::uuid, '7b12d5e2-0003-4444-8888-abcdef000102'::uuid, 'Karume Road'),
  -- Iyela Streets
  ('7b12d5e2-0004-4444-8888-abcdef001005'::uuid, '7b12d5e2-0003-4444-8888-abcdef000103'::uuid, 'Airport Road'),
  ('7b12d5e2-0004-4444-8888-abcdef001006'::uuid, '7b12d5e2-0003-4444-8888-abcdef000103'::uuid, 'Sisini Road')
ON CONFLICT (id) DO NOTHING;

-- 7. SEED COLLECTION STOPS (varied around Mbeya center -8.9000, 33.4500)
DO $$
DECLARE
  street_rec record;
  i integer;
  stop_lat numeric;
  stop_lng numeric;
BEGIN
  FOR street_rec IN SELECT id, name FROM public.streets LOOP
    FOR i IN 1..5 LOOP
      stop_lat := -8.9000 - (i * 0.005) - (random() * 0.002);
      stop_lng := 33.4500 + (i * 0.006) + (random() * 0.003);
      
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
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 101 MBY', 8.5, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 102 MBY', 10.0, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 103 MBY', 12.0, 'active'::public.vehicle_status),
  ('de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'T 104 MBY', 8.5, 'active'::public.vehicle_status)
ON CONFLICT (plate_number) DO NOTHING;

-- 9. SEED BASE COLLECTION ROUTES
INSERT INTO public.routes (id, organization_id, name, description)
VALUES 
  ('8c24f2b1-0001-4444-8888-abcdef000001'::uuid, 'de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'Sisimba Core Route', 'Covers Sokoine and Mwanjelwa key market intersections'),
  ('8c24f2b1-0001-4444-8888-abcdef000002'::uuid, 'de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'Ruanda Industrial Route', 'Covers Kawetire and Karume transport networks'),
  ('8c24f2b1-0001-4444-8888-abcdef000003'::uuid, 'de1f4b88-1234-5678-abcd-ef0123456789'::uuid, 'Iyela Suburb Loop', 'Covers Airport and Sisini residential areas')
ON CONFLICT (id) DO NOTHING;

-- 10. SEED ROUTE STOPS SEQUENCING
INSERT INTO public.route_stops (route_id, stop_id, sequence_order)
SELECT '8c24f2b1-0001-4444-8888-abcdef000001'::uuid, id, row_number() over()
FROM public.collection_stops
WHERE street_id = '7b12d5e2-0004-4444-8888-abcdef001001'::uuid
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

-- 12. SEED DUMMY AUTH USERS (Citizen, Driver, Admin)
DO $$
DECLARE
  v_citizen_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
  v_driver_id  UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid;
  v_admin_id   UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid;
  v_pass_hash  TEXT;
BEGIN
  -- Generate same encrypted password hash for 'password123'
  v_pass_hash := crypt('password123', gen_salt('bf'));

  -- A. Insert Citizen Auth Record
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'citizen@mbeya.go.tz') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_citizen_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
      'citizen@mbeya.go.tz', v_pass_hash, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role": "citizen", "full_name": "Mbeya Citizen Resident", "phone": "+255 789 111 222", "address": "Sokoine Road, Sisimba Ward, Mbeya"}'::jsonb,
      NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_citizen_id, v_citizen_id,
      format('{"sub": "%s", "email": "citizen@mbeya.go.tz"}', v_citizen_id)::jsonb,
      'email', v_citizen_id::text, NOW(), NOW(), NOW()
    );
  END IF;

  -- B. Insert Driver Auth Record
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'driver@mbeya.go.tz') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_driver_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
      'driver@mbeya.go.tz', v_pass_hash, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role": "driver", "full_name": "Mbeya Collector Driver", "phone": "+255 789 333 444", "license_number": "DL-MBY-998822"}'::jsonb,
      NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_driver_id, v_driver_id,
      format('{"sub": "%s", "email": "driver@mbeya.go.tz"}', v_driver_id)::jsonb,
      'email', v_driver_id::text, NOW(), NOW(), NOW()
    );
  END IF;

  -- C. Insert Admin Auth Record
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@mbeya.go.tz') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
      'admin@mbeya.go.tz', v_pass_hash, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role": "admin", "full_name": "Mbeya System Admin", "phone": "+255 789 555 666"}'::jsonb,
      NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_admin_id, v_admin_id,
      format('{"sub": "%s", "email": "admin@mbeya.go.tz"}', v_admin_id)::jsonb,
      'email', v_admin_id::text, NOW(), NOW(), NOW()
    );
  END IF;

END $$;

-- 13. AUTO-RECONCILE EXISTING AUTH USERS TO PUBLIC PROFILES
-- Ensures pre-existing auth users receive profiles after public schema resets.
DO $$
DECLARE
  usr record;
  v_role_id uuid;
  v_org_id uuid;
  v_meta_role text;
  v_full_name text;
  v_phone text;
BEGIN
  -- Retrieve default organization ID
  SELECT id INTO v_org_id FROM public.organizations WHERE active = true LIMIT 1;

  FOR usr IN SELECT * FROM auth.users LOOP
    -- Extract user metadata parameters
    v_meta_role := coalesce(usr.raw_user_meta_data->>'role', 'citizen');
    v_full_name := coalesce(usr.raw_user_meta_data->>'full_name', 'EcoCollect Resident');
    v_phone := coalesce(usr.raw_user_meta_data->>'phone', '');

    -- Insert profile
    INSERT INTO public.profiles (id, auth_user_id, organization_id, full_name, phone, email, status)
    VALUES (
      usr.id,
      usr.id,
      v_org_id,
      v_full_name,
      v_phone,
      usr.email,
      'active'::public.profile_status
    ) ON CONFLICT (id) DO NOTHING;

    -- Retrieve role ID for mapping
    SELECT id INTO v_role_id FROM public.roles WHERE name = v_meta_role::public.user_role LIMIT 1;
    
    -- If role ID exists, create user roles mapping
    IF v_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (profile_id, role_id)
      VALUES (usr.id, v_role_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Create subtype table records
    IF v_meta_role = 'citizen' THEN
      INSERT INTO public.citizens (id, organization_id, address)
      VALUES (usr.id, v_org_id, coalesce(usr.raw_user_meta_data->>'address', '')) ON CONFLICT (id) DO NOTHING;
    ELSIF v_meta_role = 'driver' THEN
      INSERT INTO public.drivers (id, organization_id, license_number, employment_status)
      VALUES (
        usr.id,
        v_org_id,
        coalesce(usr.raw_user_meta_data->>'license_number', 'LIC-' || upper(substring(usr.id::text from 1 for 8))),
        'active'::public.employment_status
      ) ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;
END $$;
