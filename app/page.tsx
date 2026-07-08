'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Root Redirector.
 * Reads the authenticated Supabase user profile and routes them to their portal.
 * If not authenticated, routes to the login page.
 */
export default function RootDashboardPage() {
  const router = useRouter();
  const { role, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (role === 'admin' || role === 'supervisor') {
      router.replace('/admin');
    } else if (role === 'driver') {
      router.replace('/driver');
    } else {
      router.replace('/citizen');
    }
  }, [role, isAuthenticated, isLoading, router]);

  return (
    <PageContainer className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-xs text-text-secondary font-medium tracking-wide">
          Verifying session status...
        </span>
      </div>
    </PageContainer>
  );
}
