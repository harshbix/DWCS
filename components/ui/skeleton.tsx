'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

/**
 * Base shimmer skeleton element.
 * Use as building block for content-aware loading placeholders.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-surface-container-high',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
        'before:animate-[shimmer_1.8s_infinite]',
        className
      )}
    />
  );
}

/** Skeleton for a stat KPI card */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-outline/10 bg-surface-container-lowest p-4 flex flex-col gap-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  );
}

/** Skeleton for a list row */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-outline/5">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-48" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}

/** Full dashboard loading skeleton (3 KPI cards + 2 rows) */
export function SkeletonDashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="rounded-xl border border-outline/10 bg-surface-container-lowest p-4">
        <Skeleton className="h-3 w-28 mb-3" />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}
