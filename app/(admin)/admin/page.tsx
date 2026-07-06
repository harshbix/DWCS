import React from 'react';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Placeholder route page for Administrative operations.
 */
export default function AdminPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">Admin Portal</h1>
      <p className="text-sm text-text-secondary mt-2">
        This route resolves to /admin and is reserved for municipal operations logs in Phase 2.
      </p>
    </PageContainer>
  );
}
