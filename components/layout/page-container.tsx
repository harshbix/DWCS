'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/motion/page-transition';
import { cn } from '@/utils/cn';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animate?: boolean;
}

/**
 * Common container for all dashboard page contents.
 * Sets standard maximum widths, page gutters, and entry animations.
 */
export function PageContainer({ children, className, animate = true, ...props }: PageContainerProps) {
  if (!animate) {
    return (
      <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-safe pt-safe', className)} {...props}>
        {children}
      </div>
    );
  }

  const MotionDiv = motion.div as any;

  return (
    <MotionDiv
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-safe pt-safe', className)}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}
