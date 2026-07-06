import { Variants } from 'framer-motion';
import { easeOutQuint } from './shared';

/**
 * Slide variants for panels, drawers, and sidebars.
 */
export const slideHorizontalVariants = (direction: 'left' | 'right' = 'left'): Variants => ({
  hidden: {
    x: direction === 'left' ? '-100%' : '100%',
  },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 220,
    },
  },
  exit: {
    x: direction === 'left' ? '-100%' : '100%',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
});

export const slideVerticalVariants = (direction: 'up' | 'down' = 'up'): Variants => ({
  hidden: {
    y: direction === 'up' ? '100%' : '-100%',
  },
  visible: {
    y: 0,
    transition: {
      duration: 0.35,
      ease: easeOutQuint,
    },
  },
  exit: {
    y: direction === 'up' ? '100%' : '-100%',
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
});
