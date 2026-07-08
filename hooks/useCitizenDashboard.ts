import { useQuery } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

/**
 * Custom hook to retrieve aggregated citizen dashboard metrics via Postgres RPC.
 */
export function useCitizenDashboard(citizenId?: string) {
  const supabase = createBrowserSupabaseClient();

  return useQuery({
    queryKey: ['citizen-dashboard', citizenId],
    queryFn: async () => {
      if (!citizenId) return null;
      
      const { data, error } = await supabase.rpc('v1_get_citizen_dashboard', {
        p_citizen_id: citizenId,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!citizenId,
    staleTime: 30 * 1000, // Cache fresh for 30s
  });
}
