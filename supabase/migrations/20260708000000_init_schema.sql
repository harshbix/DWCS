-- Migration: Initial Schema Setup
-- Applied on: 2026-07-08
-- Version: 20260708000000

CREATE TABLE IF NOT EXISTS public.schema_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  description text,
  applied_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.schema_versions (version, description)
VALUES ('20260708000000', 'Initial database schema and tables')
ON CONFLICT (version) DO NOTHING;

-- 1. TYPE ENUMS CREATION
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('citizen', 'driver', 'supervisor', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
    CREATE TYPE public.profile_status AS ENUM ('active', 'suspended', 'pending');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
    CREATE TYPE public.employment_status AS ENUM ('active', 'suspended', 'off-duty');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
    CREATE TYPE public.vehicle_status AS ENUM ('active', 'maintenance', 'inactive');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_type') THEN
    CREATE TYPE public.complaint_type AS ENUM (
      'missed_collection', 'illegal_dumping', 'overflowing_bin', 'damaged_container',
      'missed_payment', 'broken_truck', 'hazardous_waste', 'dead_animal', 'blocked_access', 'other'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
    CREATE TYPE public.complaint_status AS ENUM ('pending', 'investigating', 'resolved', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'critical');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_status') THEN
    CREATE TYPE public.schedule_status AS ENUM ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM ('payment_reminder', 'announcement', 'complaint_update');
  END IF;
END
$$;

-- 2. BASE REFERENCE & CONFIGURATION TABLES
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text,
  logo_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

-- Profiles table extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  auth_user_id uuid NOT NULL UNIQUE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text,
  email text NOT NULL,
  avatar_url text,
  status public.profile_status NOT NULL DEFAULT 'active'::public.profile_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

-- Establish foreign keys from auth.users (if schemas loaded inside Supabase)
DO $$
BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name public.user_role NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  CONSTRAINT user_roles_profile_role_unique UNIQUE (profile_id, role_id)
);

-- 3. GEOGRAPHIC HIERARCHY TABLES
CREATE TABLE IF NOT EXISTS public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  CONSTRAINT districts_region_name_unique UNIQUE (region_id, name)
);

CREATE TABLE IF NOT EXISTS public.wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  CONSTRAINT wards_district_name_unique UNIQUE (district_id, name)
);

CREATE TABLE IF NOT EXISTS public.streets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id uuid NOT NULL REFERENCES public.wards(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  CONSTRAINT streets_ward_name_unique UNIQUE (ward_id, name)
);

CREATE TABLE IF NOT EXISTS public.collection_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street_id uuid NOT NULL REFERENCES public.streets(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude numeric NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

-- 4. APPLICATION SPECIFIC SUBTYPES
CREATE TABLE IF NOT EXISTS public.citizens (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  street_id uuid REFERENCES public.streets(id) ON DELETE SET NULL,
  address text,
  latitude numeric CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric CHECK (longitude BETWEEN -180 AND 180),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  license_number text NOT NULL UNIQUE,
  employment_status public.employment_status NOT NULL DEFAULT 'active'::public.employment_status,
  hired_at date DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  plate_number text NOT NULL UNIQUE,
  capacity_tons numeric NOT NULL CHECK (capacity_tons > 0),
  status public.vehicle_status NOT NULL DEFAULT 'active'::public.vehicle_status,
  assigned_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

-- 5. ROUTES & SCHEDULING
CREATE TABLE IF NOT EXISTS public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_id uuid NOT NULL REFERENCES public.collection_stops(id) ON DELETE CASCADE,
  sequence_order integer NOT NULL CHECK (sequence_order > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  CONSTRAINT route_stops_route_sequence_unique UNIQUE (route_id, sequence_order),
  CONSTRAINT route_stops_route_stop_unique UNIQUE (route_id, stop_id)
);

CREATE TABLE IF NOT EXISTS public.collection_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  collection_date date NOT NULL,
  estimated_arrival time NOT NULL,
  actual_arrival time,
  status public.schedule_status NOT NULL DEFAULT 'scheduled'::public.schedule_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

-- 6. GPS TELEMETRY
CREATE TABLE IF NOT EXISTS public.vehicle_current_location (
  vehicle_id uuid PRIMARY KEY REFERENCES public.vehicles(id) ON DELETE CASCADE,
  latitude numeric NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  speed numeric NOT NULL DEFAULT 0.0 CHECK (speed >= 0),
  heading numeric NOT NULL DEFAULT 0.0 CHECK (heading BETWEEN 0 AND 360),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Partitioned historical logging
CREATE TABLE IF NOT EXISTS public.vehicle_location_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  latitude numeric NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  speed numeric NOT NULL DEFAULT 0.0 CHECK (speed >= 0),
  heading numeric NOT NULL DEFAULT 0.0 CHECK (heading BETWEEN 0 AND 360),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

CREATE TABLE IF NOT EXISTS public.vehicle_location_history_default 
  PARTITION OF public.vehicle_location_history DEFAULT;

-- 7. COMPLAINTS & GENERIC FILE METADATA
CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  citizen_id uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  street_id uuid REFERENCES public.streets(id) ON DELETE SET NULL,
  complaint_type public.complaint_type NOT NULL,
  description text NOT NULL,
  latitude numeric CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric CHECK (longitude BETWEEN -180 AND 180),
  priority public.priority_level NOT NULL DEFAULT 'medium'::public.priority_level,
  status public.complaint_status NOT NULL DEFAULT 'pending'::public.complaint_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  entity_type text NOT NULL, -- e.g., 'complaints', 'billing', 'profiles'
  entity_id uuid NOT NULL,
  bucket text NOT NULL,
  object_path text NOT NULL,
  file_name text,
  mime_type text,
  size bigint CHECK (size >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

-- 8. TRANSACTIONAL BILLING
CREATE TABLE IF NOT EXISTS public.billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  citizen_id uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'TZS',
  status public.payment_status NOT NULL DEFAULT 'pending'::public.payment_status,
  control_number text UNIQUE,
  billing_period text NOT NULL,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id uuid NOT NULL REFERENCES public.billing(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'TZS',
  status public.payment_status NOT NULL DEFAULT 'pending'::public.payment_status,
  receipt_number text UNIQUE,
  provider text,
  transaction_reference text UNIQUE,
  payment_channel text,
  payment_method text,
  payment_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

-- 9. NOTIFICATIONS & RECIPIENTS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type public.notification_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.notification_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  CONSTRAINT notification_recipients_unique UNIQUE (notification_id, recipient_id)
);

CREATE TABLE IF NOT EXISTS public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_name text,
  platform text CHECK (platform IN ('ios', 'android', 'web')),
  push_token text NOT NULL UNIQUE,
  last_seen timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

-- 10. INFRASTRUCTURE & SCALING LOGS (Partitioned)
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payload jsonb,
  result jsonb,
  error text,
  run_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  rules jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.api_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  user_id uuid,
  ip_address text,
  duration_ms integer,
  status integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS public.api_logs_default PARTITION OF public.api_logs DEFAULT;

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS public.activity_logs_default PARTITION OF public.activity_logs DEFAULT;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  admin_id uuid,
  action text not null,
  details jsonb not null,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS public.audit_logs_default PARTITION OF public.audit_logs DEFAULT;

CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  value numeric NOT NULL,
  details jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

CREATE TABLE IF NOT EXISTS public.system_metrics_default PARTITION OF public.system_metrics DEFAULT;

-- 11. AI READY TABLES
CREATE TABLE IF NOT EXISTS public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_type text NOT NULL,
  input_data jsonb,
  output_data jsonb,
  confidence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.waste_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street_id uuid REFERENCES public.streets(id) ON DELETE CASCADE,
  predicted_volume_tons numeric NOT NULL,
  target_date date NOT NULL,
  confidence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.route_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES public.collection_schedules(id) ON DELETE CASCADE,
  optimized_path jsonb NOT NULL,
  estimated_duration_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  prompt_tokens integer,
  completion_tokens integer,
  latency_ms integer,
  request_payload jsonb,
  response_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. FULL TEXT SEARCH TSVECTOR FIELDS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fts_document tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, ''))) STORED;

ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS fts_document tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(description, '') || ' ' || coalesce(complaint_type::text, ''))) STORED;

ALTER TABLE public.streets ADD COLUMN IF NOT EXISTS fts_document tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, ''))) STORED;

-- 13. AUTOMATED METADATA TRIGGER IMPLEMENTATION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Bind updated_at trigger to core non-partitioned tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'organizations', 'profiles', 'roles', 'user_roles', 'regions', 'districts', 'wards', 'streets',
    'collection_stops', 'citizens', 'drivers', 'vehicles', 'routes', 'route_stops', 'collection_schedules',
    'complaints', 'files', 'billing', 'payment_transactions', 'notifications', 'notification_recipients',
    'devices', 'jobs', 'feature_flags', 'predictions', 'waste_predictions', 'route_optimizations', 'system_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('
      CREATE OR REPLACE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
    ', t, t);
  END LOOP;
END
$$;

-- Telemetry history trigger log
CREATE OR REPLACE FUNCTION public.log_vehicle_location_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.vehicle_location_history (vehicle_id, latitude, longitude, speed, heading, recorded_at)
  VALUES (new.vehicle_id, new.latitude, new.longitude, new.speed, new.heading, new.updated_at);
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_vehicle_location_update
  AFTER INSERT OR UPDATE ON public.vehicle_current_location
  FOR EACH ROW EXECUTE PROCEDURE public.log_vehicle_location_history();

-- 14. MATERIALIZED DASHBOARD VIEWS
CREATE MATERIALIZED VIEW public.dashboard_statistics AS
SELECT
  org.id AS organization_id,
  (SELECT count(*) FROM public.citizens WHERE organization_id = org.id AND deleted_at IS NULL) AS total_citizens,
  (SELECT count(*) FROM public.drivers WHERE organization_id = org.id AND employment_status = 'active'::public.employment_status AND deleted_at IS NULL) AS active_drivers,
  (SELECT count(*) FROM public.vehicles WHERE organization_id = org.id AND status = 'active'::public.vehicle_status AND deleted_at IS NULL) AS active_vehicles,
  (SELECT count(*) FROM public.complaints WHERE organization_id = org.id AND status = 'pending'::public.complaint_status AND deleted_at IS NULL) AS pending_complaints,
  (SELECT count(*) FROM public.collection_schedules WHERE organization_id = org.id AND collection_date = current_date AND deleted_at IS NULL) AS today_collections,
  (SELECT count(*) FROM public.collection_schedules WHERE organization_id = org.id AND collection_date = current_date AND status = 'completed'::public.schedule_status AND deleted_at IS NULL) AS completed_collections,
  coalesce((
    SELECT sum(pt.amount)
    FROM public.payment_transactions pt
    JOIN public.billing b ON b.id = pt.billing_id
    WHERE b.organization_id = org.id
      AND pt.payment_date::date = current_date
      AND pt.status = 'paid'::public.payment_status
      AND pt.deleted_at IS NULL
  ), 0) AS revenue_today,
  coalesce((
    SELECT sum(pt.amount)
    FROM public.payment_transactions pt
    JOIN public.billing b ON b.id = pt.billing_id
    WHERE b.organization_id = org.id
      AND pt.payment_date >= date_trunc('month', current_date)
      AND pt.status = 'paid'::public.payment_status
      AND pt.deleted_at IS NULL
  ), 0) AS revenue_this_month,
  (SELECT count(*) FROM public.collection_schedules WHERE organization_id = org.id AND status = 'missed'::public.schedule_status AND deleted_at IS NULL) AS missed_collections
FROM public.organizations org
WHERE org.deleted_at IS NULL;

CREATE UNIQUE INDEX dashboard_stats_org_idx ON public.dashboard_statistics (organization_id);

CREATE MATERIALIZED VIEW public.zone_statistics AS
SELECT
  s.id AS street_id,
  s.name AS street_name,
  w.id AS ward_id,
  w.name AS ward_name,
  d.id AS district_id,
  d.name AS district_name,
  r.id AS region_id,
  r.name AS region_name,
  (SELECT count(*) FROM public.citizens WHERE street_id = s.id AND deleted_at IS NULL) AS total_citizens,
  (SELECT count(*) FROM public.collection_stops WHERE street_id = s.id AND deleted_at IS NULL) AS total_stops,
  (SELECT count(*) FROM public.collection_schedules WHERE route_id IN (
     SELECT route_id FROM public.route_stops rs
     JOIN public.collection_stops cs ON cs.id = rs.stop_id
     WHERE cs.street_id = s.id
  ) AND deleted_at IS NULL) AS total_schedules
FROM public.streets s
JOIN public.wards w ON w.id = s.ward_id
JOIN public.districts d ON d.id = w.district_id
JOIN public.regions r ON r.id = d.region_id
WHERE s.deleted_at IS NULL;

CREATE UNIQUE INDEX zone_stats_street_idx ON public.zone_statistics (street_id);

CREATE MATERIALIZED VIEW public.payment_statistics AS
SELECT
  org.id AS organization_id,
  (SELECT count(*) FROM public.billing WHERE organization_id = org.id AND deleted_at IS NULL) AS total_bills,
  coalesce((SELECT sum(amount) FROM public.billing WHERE organization_id = org.id AND status = 'paid'::public.payment_status AND deleted_at IS NULL), 0) AS paid_bills_amount,
  coalesce((SELECT sum(amount) FROM public.billing WHERE organization_id = org.id AND status = 'pending'::public.payment_status AND deleted_at IS NULL), 0) AS pending_bills_amount,
  (SELECT count(*) FROM public.payment_transactions pt JOIN public.billing b ON b.id = pt.billing_id WHERE b.organization_id = org.id AND pt.status = 'paid'::public.payment_status AND pt.deleted_at IS NULL) AS successful_transactions,
  (SELECT count(*) FROM public.payment_transactions pt JOIN public.billing b ON b.id = pt.billing_id WHERE b.organization_id = org.id AND pt.status = 'failed'::public.payment_status AND pt.deleted_at IS NULL) AS failed_transactions
FROM public.organizations org
WHERE org.deleted_at IS NULL;

CREATE UNIQUE INDEX payment_stats_org_idx ON public.payment_statistics (organization_id);

CREATE MATERIALIZED VIEW public.complaint_statistics AS
SELECT
  org.id AS organization_id,
  (SELECT count(*) FROM public.complaints WHERE organization_id = org.id AND deleted_at IS NULL) AS total_complaints,
  (SELECT count(*) FROM public.complaints WHERE organization_id = org.id AND status = 'pending'::public.complaint_status AND deleted_at IS NULL) AS pending_complaints,
  (SELECT count(*) FROM public.complaints WHERE organization_id = org.id AND status = 'investigating'::public.complaint_status AND deleted_at IS NULL) AS investigating_complaints,
  (SELECT count(*) FROM public.complaints WHERE organization_id = org.id AND status = 'resolved'::public.complaint_status AND deleted_at IS NULL) AS resolved_complaints,
  (SELECT count(*) FROM public.complaints WHERE organization_id = org.id AND status = 'rejected'::public.complaint_status AND deleted_at IS NULL) AS rejected_complaints
FROM public.organizations org
WHERE org.deleted_at IS NULL;

CREATE UNIQUE INDEX complaint_stats_org_idx ON public.complaint_statistics (organization_id);

-- Cache Refresh Routine (Concurrently to avoid locks)
CREATE OR REPLACE FUNCTION public.refresh_dashboard_materialized_views()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.zone_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.payment_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.complaint_statistics;
END;
$$;

-- 15. INDEX CONFIGURATIONS (Query Optimization Targets)
-- Basic FK indexes
CREATE INDEX IF NOT EXISTS profiles_organization_id_idx ON public.profiles(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS user_roles_profile_id_idx ON public.user_roles(profile_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON public.user_roles(role_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS districts_region_id_idx ON public.districts(region_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS wards_district_id_idx ON public.wards(district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS streets_ward_id_idx ON public.streets(ward_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS collection_stops_street_id_idx ON public.collection_stops(street_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS citizens_organization_id_idx ON public.citizens(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS citizens_street_id_idx ON public.citizens(street_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS drivers_organization_id_idx ON public.drivers(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS vehicles_organization_id_idx ON public.vehicles(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS vehicles_assigned_driver_id_idx ON public.vehicles(assigned_driver_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS routes_organization_id_idx ON public.routes(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS route_stops_route_id_idx ON public.route_stops(route_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS collection_schedules_organization_id_idx ON public.collection_schedules(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS collection_schedules_vehicle_id_idx ON public.collection_schedules(vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS collection_schedules_driver_id_idx ON public.collection_schedules(driver_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS collection_schedules_route_id_idx ON public.collection_schedules(route_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS complaints_citizen_id_idx ON public.complaints(citizen_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS complaints_street_id_idx ON public.complaints(street_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS files_entity_type_id_idx ON public.files(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS billing_citizen_id_idx ON public.billing(citizen_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS payment_transactions_billing_id_idx ON public.payment_transactions(billing_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS notification_recipients_recipient_id_idx ON public.notification_recipients(recipient_id) WHERE deleted_at IS NULL;

-- Temporal Index Targets
CREATE INDEX IF NOT EXISTS collection_schedules_date_idx ON public.collection_schedules(collection_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON public.billing(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_payment_date_idx ON public.payment_transactions(payment_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON public.complaints(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS api_logs_created_at_idx ON public.api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS telemetry_log_idx ON public.vehicle_location_history(vehicle_id, recorded_at DESC);

-- Composite Query Index targets
CREATE INDEX IF NOT EXISTS collection_schedules_route_date_idx ON public.collection_schedules(route_id, collection_date, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS billing_citizen_status_idx ON public.billing(citizen_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS complaints_citizen_status_idx ON public.complaints(citizen_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS complaints_status_priority_idx ON public.complaints(status, priority) WHERE deleted_at IS NULL;

-- Full-text GIN Search Indexes
CREATE INDEX IF NOT EXISTS profiles_fts_idx ON public.profiles USING gin(fts_document);
CREATE INDEX IF NOT EXISTS complaints_fts_idx ON public.complaints USING gin(fts_document);
CREATE INDEX IF NOT EXISTS streets_fts_idx ON public.streets USING gin(fts_document);

-- 16. PRIVILEGE & SECURITY DEFINER HOOKS FOR RLS POLICIES
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT exists (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.profile_id = (SELECT auth.uid())
      AND r.name = 'admin'::public.user_role
      AND ur.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION private.is_supervisor()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT exists (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.profile_id = (SELECT auth.uid())
      AND r.name = 'supervisor'::public.user_role
      AND ur.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION private.get_user_organization()
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT organization_id FROM public.profiles WHERE id = (SELECT auth.uid()) AND deleted_at IS NULL;
$$;

-- Restrict Direct Execution of Security Helpers
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.is_supervisor() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.get_user_organization() FROM PUBLIC, anon, authenticated;

-- 17. ROW LEVEL SECURITY (RLS) ACTIVATION & POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_current_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Bindings
CREATE POLICY "View Organizations" ON public.organizations FOR SELECT TO authenticated USING (active = true AND deleted_at IS NULL);
CREATE POLICY "Admin Edit Organizations" ON public.organizations FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "View Profiles" ON public.profiles FOR SELECT TO authenticated 
  USING ((SELECT auth.uid()) = id OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (organization_id = (SELECT private.get_user_organization())));
CREATE POLICY "Insert Own Profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id OR (SELECT private.is_admin()));
CREATE POLICY "Update Own Profile" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id OR (SELECT private.is_admin())) WITH CHECK ((SELECT auth.uid()) = id OR (SELECT private.is_admin()));

CREATE POLICY "View Roles" ON public.roles FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admin Roles" ON public.roles FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "View User Roles" ON public.user_roles FOR SELECT TO authenticated 
  USING ((SELECT auth.uid()) = profile_id OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()));
CREATE POLICY "Admin User Roles" ON public.user_roles FOR ALL TO authenticated USING ((SELECT private.is_admin()));

-- Geography Tables RLS
CREATE POLICY "Select Regions" ON public.regions FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admin Regions" ON public.regions FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "Select Districts" ON public.districts FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admin Districts" ON public.districts FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "Select Wards" ON public.wards FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admin Wards" ON public.wards FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "Select Streets" ON public.streets FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admin Streets" ON public.streets FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "Select Stops" ON public.collection_stops FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admin Stops" ON public.collection_stops FOR ALL TO authenticated USING ((SELECT private.is_admin()));

-- Subtype tables
CREATE POLICY "Select Citizens" ON public.citizens FOR SELECT TO authenticated 
  USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (organization_id = (SELECT private.get_user_organization())));
CREATE POLICY "Edit Citizens" ON public.citizens FOR ALL TO authenticated USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

CREATE POLICY "Select Drivers" ON public.drivers FOR SELECT TO authenticated 
  USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (organization_id = (SELECT private.get_user_organization())));
CREATE POLICY "Edit Drivers" ON public.drivers FOR ALL TO authenticated USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

CREATE POLICY "Select Vehicles" ON public.vehicles FOR SELECT TO authenticated 
  USING (organization_id = (SELECT private.get_user_organization()) OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()));
CREATE POLICY "Admin Vehicles" ON public.vehicles FOR ALL TO authenticated USING ((SELECT private.is_admin()));

-- Routes & Schedules
CREATE POLICY "Select Routes" ON public.routes FOR SELECT TO authenticated 
  USING (organization_id = (SELECT private.get_user_organization()) OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()));
CREATE POLICY "Admin Routes" ON public.routes FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "Select Route Stops" ON public.route_stops FOR SELECT TO authenticated 
  USING (exists (SELECT 1 FROM public.routes r WHERE r.id = route_id AND (r.organization_id = (SELECT private.get_user_organization()) OR (SELECT private.is_admin()))));
CREATE POLICY "Admin Route Stops" ON public.route_stops FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "Select Schedules" ON public.collection_schedules FOR SELECT TO authenticated 
  USING (organization_id = (SELECT private.get_user_organization()) OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (driver_id = (SELECT auth.uid())));
CREATE POLICY "Admin Schedules" ON public.collection_schedules FOR ALL TO authenticated USING ((SELECT private.is_admin()));
CREATE POLICY "Driver Update Schedules" ON public.collection_schedules FOR UPDATE TO authenticated USING (driver_id = (SELECT auth.uid())) WITH CHECK (driver_id = (SELECT auth.uid()));

-- Telemetry RLS
CREATE POLICY "View Locations" ON public.vehicle_current_location FOR SELECT TO authenticated USING (true);
CREATE POLICY "Driver Telemetry Current" ON public.vehicle_current_location FOR ALL TO authenticated 
  USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE assigned_driver_id = (SELECT auth.uid())))
  WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE assigned_driver_id = (SELECT auth.uid())));

CREATE POLICY "View History" ON public.vehicle_location_history FOR SELECT TO authenticated USING ((SELECT private.is_admin()) OR (SELECT private.is_supervisor()));
CREATE POLICY "Write History" ON public.vehicle_location_history FOR INSERT TO authenticated WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE assigned_driver_id = (SELECT auth.uid())));

-- Complaints, files, and invoicing
CREATE POLICY "View Complaints" ON public.complaints FOR SELECT TO authenticated 
  USING (citizen_id = (SELECT auth.uid()) OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (organization_id = (SELECT private.get_user_organization())));
CREATE POLICY "Insert Complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (citizen_id = (SELECT auth.uid()));
CREATE POLICY "Update Complaints" ON public.complaints FOR UPDATE TO authenticated 
  USING ((SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (citizen_id = (SELECT auth.uid()) AND status = 'pending'::public.complaint_status))
  WITH CHECK ((SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (citizen_id = (SELECT auth.uid()) AND status = 'pending'::public.complaint_status));

CREATE POLICY "Select Files" ON public.files FOR SELECT TO authenticated 
  USING ((SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (organization_id = (SELECT private.get_user_organization()) OR (created_by = (SELECT auth.uid()))));
CREATE POLICY "Upload Files" ON public.files FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Delete Files" ON public.files FOR DELETE TO authenticated USING (created_by = (SELECT auth.uid()) OR (SELECT private.is_admin()));

CREATE POLICY "View Billing" ON public.billing FOR SELECT TO authenticated 
  USING (citizen_id = (SELECT auth.uid()) OR (SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (organization_id = (SELECT private.get_user_organization())));
CREATE POLICY "Admin Billing" ON public.billing FOR ALL TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY "View Payments" ON public.payment_transactions FOR SELECT TO authenticated 
  USING ((SELECT private.is_admin()) OR (SELECT private.is_supervisor()) OR (exists (SELECT 1 FROM public.billing b WHERE b.id = billing_id AND (b.citizen_id = (SELECT auth.uid()) OR b.organization_id = (SELECT private.get_user_organization())))));
CREATE POLICY "Admin Payments" ON public.payment_transactions FOR ALL TO authenticated USING ((SELECT private.is_admin()));

-- Notifications and system logs RLS
CREATE POLICY "View Recipients" ON public.notification_recipients FOR SELECT TO authenticated USING (recipient_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));
CREATE POLICY "Update Read Status" ON public.notification_recipients FOR UPDATE TO authenticated USING (recipient_id = (SELECT auth.uid())) WITH CHECK (recipient_id = (SELECT auth.uid()));

CREATE POLICY "Register Devices" ON public.devices FOR ALL TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));
CREATE POLICY "View Feature Flags" ON public.feature_flags FOR SELECT TO authenticated USING (true);

-- System logs read restrictions
CREATE POLICY "Admin Logs Only" ON public.api_logs FOR SELECT TO authenticated USING ((SELECT private.is_admin()));
CREATE POLICY "Admin Activity Only" ON public.activity_logs FOR SELECT TO authenticated USING ((SELECT private.is_admin()));
CREATE POLICY "Admin Audit Only" ON public.audit_logs FOR SELECT TO authenticated USING ((SELECT private.is_admin()));

-- 18. VERSIONED DATABASE FUNCTION APIS (V1 RPC)
CREATE OR REPLACE FUNCTION public.v1_is_admin_or_supervisor_for_org(p_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles pr
    JOIN public.user_roles ur ON ur.profile_id = pr.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE pr.id = (SELECT auth.uid())
      AND pr.organization_id = p_org_id
      AND r.name IN ('admin'::public.user_role, 'supervisor'::public.user_role)
      AND pr.deleted_at IS NULL
      AND ur.deleted_at IS NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.v1_get_admin_dashboard(p_org_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_result json;
BEGIN
  IF NOT (public.v1_is_admin_or_supervisor_for_org(p_org_id)) THEN
    RAISE EXCEPTION 'Unauthorized access to organization dashboard' USING ERRCODE = '42501';
  END IF;

  SELECT json_build_object(
    'statistics', (
      SELECT json_build_object(
        'total_citizens', total_citizens,
        'active_drivers', active_drivers,
        'active_vehicles', active_vehicles,
        'pending_complaints', pending_complaints,
        'today_collections', today_collections,
        'completed_collections', completed_collections,
        'revenue_today', revenue_today,
        'revenue_this_month', revenue_this_month,
        'missed_collections', missed_collections
      ) FROM public.dashboard_statistics WHERE organization_id = p_org_id
    ),
    'recent_complaints', (
      SELECT coalesce(json_agg(t), '[]'::json)
      FROM (
        SELECT id, citizen_id, complaint_type, priority, status, created_at
        FROM public.complaints
        WHERE organization_id = p_org_id AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 5
      ) t
    ),
    'active_drivers', (
      SELECT coalesce(json_agg(t), '[]'::json)
      FROM (
        SELECT d.id, pr.full_name, d.employment_status, v.plate_number
        FROM public.drivers d
        JOIN public.profiles pr ON pr.id = d.id
        LEFT JOIN public.vehicles v ON v.assigned_driver_id = d.id
        WHERE d.organization_id = p_org_id AND d.deleted_at IS NULL
        LIMIT 5
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.v1_get_driver_dashboard(p_driver_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_result json;
BEGIN
  IF NOT (
    (SELECT auth.uid()) = p_driver_id 
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.profile_id = (SELECT auth.uid())
        AND r.name IN ('admin'::public.user_role, 'supervisor'::public.user_role)
        AND ur.deleted_at IS NULL
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', pr.id,
        'full_name', pr.full_name,
        'phone', pr.phone,
        'email', pr.email,
        'license_number', d.license_number,
        'status', d.employment_status
      )
      FROM public.drivers d
      JOIN public.profiles pr ON pr.id = d.id
      WHERE d.id = p_driver_id AND d.deleted_at IS NULL
    ),
    'assigned_vehicle', (
      SELECT json_build_object(
        'id', v.id,
        'plate_number', v.plate_number,
        'capacity_tons', v.capacity_tons,
        'status', v.status
      )
      FROM public.vehicles v
      WHERE v.assigned_driver_id = p_driver_id AND v.deleted_at IS NULL
      LIMIT 1
    ),
    'today_schedules', (
      SELECT coalesce(json_agg(t), '[]'::json)
      FROM (
        SELECT cs.id, cs.collection_date, cs.estimated_arrival, cs.status, r.name AS route_name
        FROM public.collection_schedules cs
        JOIN public.routes r ON r.id = cs.route_id
        WHERE cs.driver_id = p_driver_id 
          AND cs.collection_date = current_date
          AND cs.deleted_at IS NULL
        ORDER BY cs.estimated_arrival ASC
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.v1_get_citizen_dashboard(p_citizen_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_result json;
BEGIN
  IF NOT (
    (SELECT auth.uid()) = p_citizen_id 
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.profile_id = (SELECT auth.uid())
        AND r.name IN ('admin'::public.user_role, 'supervisor'::public.user_role)
        AND ur.deleted_at IS NULL
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', pr.id,
        'full_name', pr.full_name,
        'phone', pr.phone,
        'email', pr.email,
        'address', c.address
      )
      FROM public.citizens c
      JOIN public.profiles pr ON pr.id = c.id
      WHERE c.id = p_citizen_id AND c.deleted_at IS NULL
    ),
    'recent_bills', (
      SELECT coalesce(json_agg(t), '[]'::json)
      FROM (
        SELECT b.id, b.amount, b.currency, b.status, b.control_number, b.billing_period, b.due_date
        FROM public.billing b
        WHERE b.citizen_id = p_citizen_id AND b.deleted_at IS NULL
        ORDER BY b.due_date DESC
        LIMIT 5
      ) t
    ),
    'recent_complaints', (
      SELECT coalesce(json_agg(t), '[]'::json)
      FROM (
        SELECT comp.id, comp.complaint_type, comp.priority, comp.status, comp.created_at
        FROM public.complaints comp
        WHERE comp.citizen_id = p_citizen_id AND comp.deleted_at IS NULL
        ORDER BY comp.created_at DESC
        LIMIT 5
      ) t
    ),
    'next_schedule', (
      SELECT json_build_object(
        'id', cs.id,
        'collection_date', cs.collection_date,
        'estimated_arrival', cs.estimated_arrival,
        'status', cs.status,
        'driver_name', pr.full_name,
        'vehicle_plate', v.plate_number
      )
      FROM public.collection_schedules cs
      JOIN public.routes r ON r.id = cs.route_id
      JOIN public.route_stops rs ON rs.route_id = r.id
      JOIN public.collection_stops stop ON stop.id = rs.stop_id
      JOIN public.citizens cit ON cit.street_id = stop.street_id
      JOIN public.profiles pr ON pr.id = cs.driver_id
      JOIN public.vehicles v ON v.id = cs.vehicle_id
      WHERE cit.id = p_citizen_id
        AND cs.collection_date >= current_date
        AND cs.status = 'scheduled'::public.schedule_status
        AND cs.deleted_at IS NULL
      ORDER BY cs.collection_date ASC, cs.estimated_arrival ASC
      LIMIT 1
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.v1_assign_driver_to_schedule(p_schedule_id uuid, p_driver_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.profile_id = (SELECT auth.uid())
        AND r.name IN ('admin'::public.user_role, 'supervisor'::public.user_role)
        AND ur.deleted_at IS NULL
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  UPDATE public.collection_schedules
  SET driver_id = p_driver_id,
      updated_at = now(),
      updated_by = (SELECT auth.uid())
  WHERE id = p_schedule_id;

  INSERT INTO public.activity_logs (organization_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    (SELECT organization_id FROM public.collection_schedules WHERE id = p_schedule_id),
    (SELECT auth.uid()),
    'driver_reassigned',
    'collection_schedules',
    p_schedule_id,
    json_build_object('driver_id', p_driver_id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.v1_complete_collection(p_schedule_id uuid, p_actual_arrival time)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  UPDATE public.collection_schedules
  SET status = 'completed'::public.schedule_status,
      actual_arrival = p_actual_arrival,
      updated_at = now(),
      updated_by = (SELECT auth.uid())
  WHERE id = p_schedule_id;

  INSERT INTO public.activity_logs (organization_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    (SELECT organization_id FROM public.collection_schedules WHERE id = p_schedule_id),
    (SELECT auth.uid()),
    'collection_completed',
    'collection_schedules',
    p_schedule_id,
    json_build_object('actual_arrival', p_actual_arrival)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.v1_submit_payment(
  p_billing_id uuid,
  p_amount numeric,
  p_transaction_reference text,
  p_provider text,
  p_payment_method text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_receipt text;
BEGIN
  v_receipt := 'REC-' || upper(substring(gen_random_uuid()::text FROM 1 FOR 8));

  INSERT INTO public.payment_transactions (
    billing_id,
    amount,
    status,
    receipt_number,
    provider,
    transaction_reference,
    payment_method,
    payment_date
  ) VALUES (
    p_billing_id,
    p_amount,
    'paid'::public.payment_status,
    v_receipt,
    p_provider,
    p_transaction_reference,
    p_payment_method,
    now()
  );

  UPDATE public.billing
  SET status = 'paid'::public.payment_status,
      updated_at = now(),
      updated_by = (SELECT auth.uid())
  WHERE id = p_billing_id;

  INSERT INTO public.activity_logs (organization_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    (SELECT organization_id FROM public.billing WHERE id = p_billing_id),
    (SELECT auth.uid()),
    'payment_submitted',
    'billing',
    p_billing_id,
    json_build_object('amount', p_amount, 'transaction_reference', p_transaction_reference, 'receipt_number', v_receipt)
  );
END;
$$;

-- 19. SCHEMA COMMENTS FOR SELF-DOCUMENTATION
COMMENT ON TABLE public.organizations IS 'Holds distinct councils or multi-tenant organizational units in municipal management';
COMMENT ON COLUMN public.organizations.region IS 'The primary administrative region of operation (e.g. Dar es Salaam)';
COMMENT ON TABLE public.profiles IS 'Extended identity records bound 1-to-1 with auth.users in Supabase';
COMMENT ON TABLE public.roles IS 'Fixed security roles mapping to administrative access controls';
COMMENT ON TABLE public.user_roles IS 'Many-to-many relationship mapping linking profiles to distinct permission roles';
COMMENT ON TABLE public.regions IS 'Highest level geographical partition structure (Regions)';
COMMENT ON TABLE public.districts IS 'Second-tier geographical partitions (Districts)';
COMMENT ON TABLE public.wards IS 'Third-tier geographical wards subdivisions';
COMMENT ON TABLE public.streets IS 'Local street locations for route mapping';
COMMENT ON TABLE public.collection_stops IS 'Designated trash bins or physical stop locations for trucks';
COMMENT ON TABLE public.citizens IS 'Profile subtype containing detailed resident and household parameters';
COMMENT ON TABLE public.drivers IS 'Profile subtype mapping driver credentials and collector statuses';
COMMENT ON TABLE public.vehicles IS 'Trash collection trucks details';
COMMENT ON TABLE public.routes IS 'Optimized path groupings containing a set of sequential stops';
COMMENT ON TABLE public.route_stops IS 'Join table sequencing stops within a specific collection route';
COMMENT ON TABLE public.collection_schedules IS 'Daily assignments tracking vehicles, drivers, and target routes';
COMMENT ON TABLE public.vehicle_current_location IS 'Telemetry cache storing only the single latest live location for active vehicles';
COMMENT ON TABLE public.vehicle_location_history IS 'Partitioned telemetry log capturing GPS location histories over time';
COMMENT ON TABLE public.complaints IS 'Resident reports indicating issues like missed pickups or dumping';
COMMENT ON TABLE public.files IS 'Consolidated generic metadata register linking upload files in Supabase Storage';
COMMENT ON TABLE public.billing IS 'Citizen invoice registers tracking municipal balances and dues';
COMMENT ON TABLE public.payment_transactions IS 'Individual billing settlement transaction logs';
COMMENT ON TABLE public.notifications IS 'Broadcast messages and automated notification titles';
COMMENT ON TABLE public.notification_recipients IS 'Recipient read-unread tracking ledger for notifications';

-- 20. SUPABASE STORAGE BUCKETS INSERTION & STORAGE POLICIES
DO $$
BEGIN
  -- Insert Buckets if they do not exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
    ('complaints', 'complaints', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
    ('receipts', 'receipts', false, 5242880, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
    ('documents', 'documents', false, 20971520, NULL)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN others THEN NULL;
END
$$;

-- Create Storage Policies in storage.objects (if schema is available)
DO $$
BEGIN
  -- Recreate policies on storage.objects if storage exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
    DROP POLICY IF EXISTS "Public Avatars View" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar Owner Write" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar Owner Delete" ON storage.objects;
    DROP POLICY IF EXISTS "Complaints Authorized View" ON storage.objects;
    DROP POLICY IF EXISTS "Complaints Citizen Write" ON storage.objects;

    CREATE POLICY "Public Avatars View" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    CREATE POLICY "Avatar Owner Write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);
    CREATE POLICY "Avatar Owner Delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);
    
    CREATE POLICY "Complaints Authorized View" ON storage.objects FOR SELECT USING (
      bucket_id = 'complaints' AND (
        (SELECT private.is_admin()) 
        OR (SELECT private.is_supervisor()) 
        OR (SELECT auth.uid())::text = (storage.foldername(name))[2]
      )
    );
    CREATE POLICY "Complaints Citizen Write" ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'complaints' AND (SELECT auth.uid())::text = (storage.foldername(name))[2]
    );
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END
$$;

-- 21. REALTIME PUBLICATION REGISTRATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Drop tables if already assigned
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.vehicle_current_location;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifications;
    ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.collection_schedules;
    
    -- Add tables
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_current_location;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_schedules;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END
$$;

-- 22. AUTOMATED USER PROFILING TRIGGER ON auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_role_id uuid;
  v_org_id uuid;
  v_meta_role text;
  v_full_name text;
  v_phone text;
BEGIN
  -- Retrieve default organization ID (seeding defaults)
  SELECT id INTO v_org_id FROM public.organizations WHERE active = true LIMIT 1;
  
  -- Extract user metadata parameters
  v_meta_role := coalesce(new.raw_user_meta_data->>'role', 'citizen');
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', 'EcoCollect Resident');
  v_phone := coalesce(new.raw_user_meta_data->>'phone', '');

  -- Insert profile
  INSERT INTO public.profiles (id, auth_user_id, organization_id, full_name, phone, email, status)
  VALUES (
    new.id,
    new.id,
    v_org_id,
    v_full_name,
    v_phone,
    new.email,
    'active'::public.profile_status
  );

  -- Retrieve role ID for mapping
  SELECT id INTO v_role_id FROM public.roles WHERE name = v_meta_role::public.user_role LIMIT 1;
  
  -- If role ID exists, create user roles mapping
  IF v_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (profile_id, role_id)
    VALUES (new.id, v_role_id);
  END IF;

  -- Create subtype table records
  IF v_meta_role = 'citizen' THEN
    INSERT INTO public.citizens (id, organization_id, address)
    VALUES (new.id, v_org_id, coalesce(new.raw_user_meta_data->>'address', ''));
  ELSIF v_meta_role = 'driver' THEN
    INSERT INTO public.drivers (id, organization_id, license_number, employment_status)
    VALUES (
      new.id,
      v_org_id,
      coalesce(new.raw_user_meta_data->>'license_number', 'LIC-' || upper(substring(new.id::text from 1 for 8))),
      'active'::public.employment_status
    );
  END IF;

  RETURN new;
END;
$$;

-- Trigger to execute on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

