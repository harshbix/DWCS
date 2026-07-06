import React from 'react';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Placeholder route page for Waste Collector Driver operations.
 */
export default function DriverPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">Driver Portal</h1>
      <p className="text-sm text-text-secondary mt-2">
        This route resolves to /driver and is reserved for collector driver route schedules in Phase 2.
      </p>
    </PageContainer>
  );
}
