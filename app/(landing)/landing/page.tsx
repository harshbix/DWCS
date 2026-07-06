import React from 'react';
import { PageContainer } from '@/components/layout/page-container';

/**
 * Placeholder route page for the public systems landing pages.
 */
export default function LandingPage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-extrabold text-text-primary tracking-tight sm:text-4xl">
        EcoCollect Tanzania
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary">
        This route resolves to /landing and will serve the public marketing page.
      </p>
    </PageContainer>
  );
}
