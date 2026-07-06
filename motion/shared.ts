/**
 * Reusable motion curves and timing parameters for Framer Motion.
 */

// Smooth Apple-style ease-out curve
export const easeOutQuint = [0.16, 1, 0.3, 1] as const;

// Elastic spring configuration for micro-interactions
export const springDefault = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const;

// Standard fade transition
export const transitionDefault = {
  duration: 0.25,
  ease: easeOutQuint,
} as const;

// Fast micro-animation transition
export const transitionFast = {
  duration: 0.15,
  ease: 'easeInOut',
} as const;
