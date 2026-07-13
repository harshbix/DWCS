'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader
 *
 * Reusable header for sub-pages. Provides:
 * - Optional back button (navigates to backHref or calls router.back())
 * - Title + optional subtitle
 * - Optional right-side action slot (e.g. filter button, add button)
 *
 * Usage:
 *   <PageHeader title="Complaints" subtitle="3 open" showBack />
 *   <PageHeader title="Settings" action={<Button>Save</Button>} />
 */
export function PageHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
  action,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 pt-5 pb-4',
        className
      )}
    >
      {showBack && (
        <button
          onClick={handleBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-on-surface/70" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-on-surface leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-on-surface/50 mt-0.5 leading-none">{subtitle}</p>
        )}
      </div>

      {action && (
        <div className="shrink-0 flex items-center gap-2">{action}</div>
      )}
    </div>
  );
}
