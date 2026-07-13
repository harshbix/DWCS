'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Global Route Error Page.
 * Rendered by Next.js when an unhandled error occurs in any route segment.
 * Provides clear recovery options without exposing internal error details.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 text-center bg-background">
      <div className="h-16 w-16 rounded-2xl bg-error/10 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-error" />
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="text-lg font-bold text-on-surface">Something went wrong</h1>
        <p className="text-sm text-on-surface/60 leading-relaxed">
          An unexpected error occurred. If the problem persists, please contact support.
        </p>
        {error.digest && (
          <p className="text-[10px] text-on-surface/30 font-mono mt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-outline/20 bg-surface text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
        >
          <Home className="h-4 w-4" />
          Go Home
        </button>
      </div>
    </div>
  );
}
