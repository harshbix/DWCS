import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

/**
 * Reusable Avatar profile component.
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback = '?', ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-outline/10 bg-surface-container-high',
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            onError={() => setImageError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-container-high text-sm font-semibold text-text-secondary select-none uppercase">
            {fallback.slice(0, 2)}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
