import React from 'react';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Placeholder route page for portal authentication.
 */
export default function LoginPage() {
  return (
    <PageContainer className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-outline/10 bg-surface-container-lowest p-8 shadow-md">
        <h2 className="text-xl font-bold text-center text-text-primary">Sign in to EcoCollect</h2>
        <p className="text-xs text-text-secondary text-center mt-1.5">
          Tanzania Waste Management Authority Authentication Portal
        </p>
        <div className="mt-8 text-center text-sm text-text-secondary">
          Reserved for Supabase Login interface. Active in Phase 2.
        </div>
      </div>
    </PageContainer>
  );
}
