/**
 * EcoCollect Tanzania Design Tokens & Theme Constants.
 * Central source of truth for design parameters, matching the Stitch prototype.
 */
export const theme = {
  colors: {
    primary: {
      default: '#0f5238', // Deep Forest Green
      container: '#2d6a4f',
      onPrimary: '#ffffff',
      onContainer: '#a8e7c5',
    },
    secondary: {
      default: '#4c6452',
      container: '#cce6d0',
      onContainer: '#506856',
    },
    tertiary: {
      default: '#004691', // Tanzanian Blue
      container: '#005dbd',
      onContainer: '#cadaff',
    },
    background: '#fcf8fb',
    surface: {
      default: '#fcf8fb',
      container: '#f0edef',
      containerLow: '#f6f3f5',
      containerLowest: '#ffffff',
      containerHigh: '#eae7ea',
      containerHighest: '#e4e2e4',
    },
    text: {
      primary: '#1b1b1d',
      secondary: '#404943',
      inverse: '#ffffff',
    },
    outline: {
      default: '#707973',
      variant: '#bfc9c1',
    },
    error: {
      default: '#ba1a1a',
      container: '#ffdad6',
      onContainer: '#93000a',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  transitions: {
    fast: '0.15s ease-in-out',
    default: '0.25s ease-in-out',
    slow: '0.4s ease-in-out',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    toast: 1070,
  },
} as const;

export type Theme = typeof theme;
