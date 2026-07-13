-- Migration: EcoCollect Database Query & Index Polish
-- Applied on: 2026-07-13
-- Version: 20260713000000

-- 1. Create Performance Indexes for soft delete checks (deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_user_roles_deleted_at ON public.user_roles (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_billing_deleted_at ON public.billing (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_collection_schedules_deleted_at ON public.collection_schedules (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_deleted_at ON public.vehicles (deleted_at) WHERE deleted_at IS NULL;

-- 2. Optimize vehicle current location tracking indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_current_location_updated_at ON public.vehicle_current_location (updated_at DESC);

-- 3. Adjust RPC search paths to lock security scope
ALTER FUNCTION public.v1_get_citizen_dashboard(uuid) SET search_path = public, private;
ALTER FUNCTION public.v1_get_driver_dashboard(uuid) SET search_path = public, private;
ALTER FUNCTION public.v1_get_admin_dashboard(uuid) SET search_path = public, private;
