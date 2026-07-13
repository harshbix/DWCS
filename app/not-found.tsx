import React from 'react';
import { Leaf, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Global 404 Not Found Page.
 * Rendered by Next.js when no route matches the requested URL.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 text-center bg-background">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-base leading-none text-on-surface">EcoCollect</span>
          <span className="text-[9px] text-on-surface/40 font-medium tracking-widest uppercase mt-0.5">
            Mbeya · MWMA
          </span>
        </div>
      </div>

      {/* 404 Display */}
      <div className="flex flex-col gap-3 max-w-sm">
        <p className="text-7xl font-black text-primary/15 leading-none">404</p>
        <h1 className="text-xl font-bold text-on-surface -mt-2">Page Not Found</h1>
        <p className="text-sm text-on-surface/60 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="javascript:history.back()"
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-outline/20 bg-surface text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Link>
      </div>
    </div>
  );
}
