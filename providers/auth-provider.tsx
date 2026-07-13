'use client';

import { useEffect, useRef } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import type { UserRole } from '@/stores/auth.store';

/**
 * AuthProvider
 *
 * Listens to Supabase auth state changes and keeps the Zustand auth store
 * in sync with the real authenticated user role. This is a thin, invisible
 * wrapper that mounts once at the root layout level.
 *
 * On SIGNED_IN: fetches user roles from the DB and sets the correct role.
 * On SIGNED_OUT: resets the store to default citizen role.
 * On TOKEN_REFRESHED: silently updates — no action needed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserSupabaseClient();
  const { setRole, setOrganizationId } = useAuthStore();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  useEffect(() => {
    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear all cached query data on sign-out
        queryClient.clear();
        setRole('citizen');
        setOrganizationId(null);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (!session?.user) return;

        // Invalidate stale auth queries so fresh data is fetched
        queryClient.invalidateQueries({ queryKey: ['supabase-user'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile', session.user.id] });

        // Only fetch roles once per session (not on every token refresh)
        if (event === 'TOKEN_REFRESHED' && initialized.current) return;
        initialized.current = true;

        try {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('profile_id', session.user.id)
            .is('deleted_at', null);

          const roles = (rolesData ?? [])
            .map((r: any) => r.roles?.name as string)
            .filter(Boolean);

          // Sync the Zustand store with the real role
          let primaryRole: UserRole = 'citizen';
          if (roles.includes('admin') || roles.includes('supervisor')) {
            primaryRole = 'admin';
          } else if (roles.includes('driver')) {
            primaryRole = 'driver';
          }
          setRole(primaryRole);

          // Also sync organization ID from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', session.user.id)
            .single();

          if (profile?.organization_id) {
            setOrganizationId(profile.organization_id);
          }
        } catch {
          // Non-critical — store defaults to citizen which is safe
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setRole, setOrganizationId, queryClient]);

  return <>{children}</>;
}
