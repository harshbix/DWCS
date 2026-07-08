import { useQuery } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

/**
 * Custom hook to retrieve aggregated driver schedule metrics via Postgres RPC.
 */
export function useDriverDashboard(driverId?: string) {
  const supabase = createBrowserSupabaseClient();

  return useQuery({
    queryKey: ['driver-dashboard', driverId],
    queryFn: async () => {
      if (!driverId) return null;

      const { data, error } = await supabase.rpc('v1_get_driver_dashboard', {
        p_driver_id: driverId,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!driverId,
    staleTime: 30 * 1000,
  });
}
