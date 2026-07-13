-- Migration: EcoCollect Performance Indexes and Schema Updates
-- Applied on: 2026-07-12
-- Version: 20260712000000

-- 1. Create Performance Indexes for RLS Predicates and Dashboard Joins
CREATE INDEX IF NOT EXISTS idx_user_roles_profile_id ON public.user_roles (profile_id);
CREATE INDEX IF NOT EXISTS idx_billing_citizen_id ON public.billing (citizen_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_billing_id ON public.payment_transactions (billing_id);
CREATE INDEX IF NOT EXISTS idx_collection_schedules_driver_id ON public.collection_schedules (driver_id);
CREATE INDEX IF NOT EXISTS idx_collection_schedules_vehicle_id ON public.collection_schedules (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_current_location_vehicle_id ON public.vehicle_current_location (vehicle_id);

-- 2. Update v1_get_citizen_dashboard function to return vehicle_id
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
        'vehicle_plate', v.plate_number,
        'vehicle_id', v.id -- ENRICHED: Return vehicle ID for real-time tracking subscription
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
