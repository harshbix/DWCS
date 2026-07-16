import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cache } from 'react';

export const getAdminDashboard = cache(async (orgId: string) => {
  if (orgId === 'dummy-org-id') {
    return {
      statistics: { total_citizens: 100, active_drivers: 10, active_vehicles: 5, revenue_today: 5000, revenue_this_month: 150000, pending_complaints: 2 },
      citizens: [],
      fleet: [],
      recent_complaints: []
    };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('v1_get_admin_dashboard', {
    p_org_id: orgId,
  });
  if (error) throw error;
  return data;
});

export const getCitizenDashboard = cache(async (citizenId: string) => {
  if (citizenId === 'dummy-user-id') {
    return {
      profile: null,
      recent_bills: [],
      next_schedule: null,
      complaint_summary: { total: 0, pending: 0, resolved: 0 }
    };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('v1_get_citizen_dashboard', {
    p_citizen_id: citizenId,
  });
  if (error) throw error;
  return data;
});

export const getDriverDashboard = cache(async (driverId: string) => {
  if (driverId === 'dummy-user-id') {
    return {
      driver_profile: null,
      assigned_vehicle: null,
      active_schedules: [],
      completed_today: 0,
      total_today: 0
    };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('v1_get_driver_dashboard', {
    p_driver_id: driverId,
  });
  if (error) throw error;
  return data;
});
