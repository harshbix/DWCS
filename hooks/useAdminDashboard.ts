import { useQuery } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

/**
 * Custom hook to retrieve aggregated admin metrics via Postgres RPC.
 */
export function useAdminDashboard(organizationId?: string, initialData?: any) {
  const supabase = createBrowserSupabaseClient();

  return useQuery({
    queryKey: ['admin-dashboard', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase.rpc('v1_get_admin_dashboard', {
        p_org_id: organizationId,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
    initialData,
    staleTime: 30 * 1000,
  });
}
