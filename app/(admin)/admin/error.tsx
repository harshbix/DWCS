'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Admin portal route-level error boundary.
 * Catches errors within the /admin route group.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center bg-background">
      <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-error" />
      </div>
      <div className="flex flex-col gap-1 max-w-xs">
        <h2 className="text-base font-bold text-on-surface">Admin portal error</h2>
        <p className="text-xs text-on-surface/60">
          {error.message || 'An error occurred in the admin panel. Please retry.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  );
}
