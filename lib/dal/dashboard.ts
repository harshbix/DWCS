import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cache } from 'react';

export const getAdminDashboard = cache(async (orgId: string) => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('v1_get_admin_dashboard', {
    p_org_id: orgId,
  });
  if (error) throw error;
  return data;
});

export const getCitizenDashboard = cache(async (citizenId: string) => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('v1_get_citizen_dashboard', {
    p_citizen_id: citizenId,
  });
  if (error) throw error;
  return data;
});

export const getDriverDashboard = cache(async (driverId: string) => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('v1_get_driver_dashboard', {
    p_driver_id: driverId,
  });
  if (error) throw error;
  return data;
});
