import { Variants } from 'framer-motion';
import { transitionDefault } from './shared';

/**
 * Reusable fade variants.
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitionDefault,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};
