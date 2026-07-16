import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import type { UserProfile, UserRoleName } from '@/types/database';

export type { UserProfile, UserRoleName };

/**
 * Custom hook to retrieve active Supabase Auth user sessions and profile properties.
 * Handles state caching via TanStack Query and prevents duplicate calls.
 */
export function useAuth() {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  const isDummyAuth = typeof window !== 'undefined' && document.cookie.includes('dummy-auth=true');

  // Query to fetch the Supabase Auth User object
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['supabase-user'],
    queryFn: async () => {
      if (isDummyAuth) {
        const cookies = document.cookie.split('; ');
        const emailCookie = cookies.find(row => row.startsWith('dummy-email='))?.split('=')[1] || 'dummy@example.com';
        return { id: 'dummy-user-id', email: decodeURIComponent(emailCookie) };
      }
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Query to fetch public.profiles and roles for the user
  const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile | null>({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      if (isDummyAuth) {
        const email = user.email || 'dummy@example.com';
        let role: UserRoleName = 'citizen';
        if (email.includes('admin')) role = 'admin';
        else if (email.includes('driver')) role = 'driver';
        else if (email.includes('supervisor')) role = 'supervisor';

        return {
          id: user.id,
          organization_id: 'dummy-org-id',
          full_name: role === 'admin' ? 'System Administrator' : role === 'driver' ? 'Test Driver' : 'Test Citizen',
          phone: '+255 700 000000',
          email: email,
          avatar_url: null,
          status: 'active',
          roles: [role],
          primaryRole: role,
        } as UserProfile;
      }

      // 1. Query Profile fields
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // 2. Query mapped roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('profile_id', user.id)
        .is('deleted_at', null);

      if (rolesError) throw rolesError;

      const roles = (rolesData ?? []).map(
        (r: any) => ((r.roles as any)?.name ?? 'citizen') as UserRoleName
      );

      // Determine Primary Role (Admin > Supervisor > Driver > Citizen)
      let primaryRole: UserRoleName = 'citizen';
      if (roles.includes('admin')) primaryRole = 'admin';
      else if (roles.includes('supervisor')) primaryRole = 'supervisor';
      else if (roles.includes('driver')) primaryRole = 'driver';

      return {
        id: profileData.id,
        organization_id: profileData.organization_id,
        full_name: profileData.full_name,
        phone: profileData.phone || '',
        email: profileData.email,
        avatar_url: profileData.avatar_url,
        status: profileData.status,
        roles,
        primaryRole,
      } satisfies UserProfile;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const logout = async () => {
    if (isDummyAuth) {
      document.cookie = 'dummy-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'dummy-email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    await supabase.auth.signOut();
    queryClient.setQueryData(['supabase-user'], null);
    queryClient.setQueryData(['user-profile', user?.id], null);
    queryClient.invalidateQueries();
  };

  return {
    user,
    profile,
    role: profile?.primaryRole ?? null,
    organization_id: profile?.organization_id ?? null,
    isAuthenticated: !!user,
    isLoading: isUserLoading || isProfileLoading,
    logout,
  };
}
