import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple CSS class inputs into a single merged tailwind list.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
