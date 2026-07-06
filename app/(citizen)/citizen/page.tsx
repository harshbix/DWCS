import React from 'react';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Placeholder route page for Citizen operations.
 */
export default function CitizenPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">Citizen Portal</h1>
      <p className="text-sm text-text-secondary mt-2">
        This route resolves to /citizen and is reserved for individual citizen portal pages in Phase 2.
      </p>
    </PageContainer>
  );
}
