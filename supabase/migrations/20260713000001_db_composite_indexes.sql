-- Migration: Composite Performance Indexes
-- Applied on: 2026-07-13
-- Version: 20260713000001

-- Accelerates Driver Dashboard today_schedules queries
CREATE INDEX IF NOT EXISTS idx_cs_driver_date_status ON public.collection_schedules(driver_id, collection_date, status) WHERE deleted_at IS NULL;

-- Accelerates Citizen Dashboard next_schedule 7-table join
CREATE INDEX IF NOT EXISTS idx_citizens_street_id_id ON public.citizens(street_id, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_route_stops_route_stop ON public.route_stops(route_id, stop_id) WHERE deleted_at IS NULL;
