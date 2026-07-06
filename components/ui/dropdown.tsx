'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { popScaleVariants } from '@/motion/scale';

interface DropdownContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextProps | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a <DropdownMenu /> component');
  }
  return context;
}

interface DropdownMenuProps {
  children: React.ReactNode;
}

/**
 * Root container for dropdown actions.
 */
export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left" ref={containerRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

/**
 * Action button triggering the dropdown list.
 */
export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        setIsOpen(!isOpen);
      },
    });
  }

  return (
    <button onClick={() => setIsOpen(!isOpen)} type="button">
      {children}
    </button>
  );
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'right';
}

/**
 * Floating content panel aligned left or right, containing option lists.
 */
export function DropdownMenuContent({ children, className, align = 'right', ...props }: DropdownMenuContentProps) {
  const { isOpen, setIsOpen } = useDropdown();

  const MotionDiv = motion.div as any;

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          variants={popScaleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => setIsOpen(false)}
          className={cn(
            'absolute z-30 mt-2 w-56 origin-top-right rounded-lg border border-outline/10 bg-surface-container-lowest p-1 shadow-lg focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          {...props}
        >
          {children}
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Clickable row menu item.
 */
export function DropdownMenuItem({ children, className, disabled, onClick, ...props }: DropdownMenuItemProps) {
  const { setIsOpen } = useDropdown();

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
    setIsOpen(false);
  };

  return (
    <button
      onClick={handleSelect}
      disabled={disabled}
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:hover:bg-transparent select-none cursor-pointer focus:outline-none',
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
