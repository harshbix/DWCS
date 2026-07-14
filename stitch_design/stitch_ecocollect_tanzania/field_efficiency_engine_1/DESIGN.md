---
name: Field Efficiency Engine
colors:
  surface: '#f6f9ff'
  surface-dim: '#d4dbe3'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4fd'
  surface-container: '#e8eef7'
  surface-container-high: '#e2e9f1'
  surface-container-highest: '#dce3ec'
  on-surface: '#151c22'
  on-surface-variant: '#404943'
  inverse-surface: '#2a3138'
  inverse-on-surface: '#ebf1fa'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#3f6653'
  on-secondary: '#ffffff'
  secondary-container: '#beead1'
  on-secondary-container: '#436b58'
  tertiary: '#364d3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d6553'
  on-tertiary-container: '#c6e1ca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#c1ecd4'
  secondary-fixed-dim: '#a5d0b9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#274e3d'
  tertiary-fixed: '#cee9d3'
  tertiary-fixed-dim: '#b3cdb7'
  on-tertiary-fixed: '#092012'
  on-tertiary-fixed-variant: '#354c3b'
  background: '#f6f9ff'
  on-background: '#151c22'
  surface-variant: '#dce3ec'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 22px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-md-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  edge-margin: 16px
  touch-target-min: 44px
---

## Brand & Style

The design system is engineered for high-stakes operational environments where clarity and speed are paramount. It targets professional field operators and municipal drivers who require immediate data recognition under varying light conditions. 

The aesthetic is a hybrid of **Corporate Modern** and **Glassmorphism**. It leverages the structural reliability of enterprise software with the sophisticated visual layering of high-end consumer electronics. The emotional response is one of calm authority, precision, and frictionless utility. High-contrast elements ensure legibility at a glance, while subtle translucency in overlays provides spatial context without obscuring critical background data.

## Colors

The palette is anchored in a professional municipal spectrum. **Deep Emerald (#2D6A4F)** serves as the primary brand and action color, signaling growth and operational "go" states. **Slate Grays** are utilized for secondary text and structural borders to reduce visual noise compared to pure black. 

**Clean Whites** and off-whites form the base of the UI to maximize contrast. For "Zero-Scroll" layouts, color is used sparingly but purposefully: 
- **Primary Emerald** for main calls to action and active status indicators.
- **Tints of Emerald** for background fills in cards to denote "active" or "assigned" work.
- **Slate Grays** for metadata and inactive states to maintain hierarchy.

## Typography

This design system utilizes **Plus Jakarta Sans** exclusively to leverage its high x-height and modern, geometric legibility. Typography is the primary driver of the hierarchy; font weights are intentionally heavy (Semi-Bold to Bold) for critical data points like "Route Number" or "Stop Time" to ensure readability in vibrating vehicle environments.

For zero-scroll layouts, use `label-bold` for category headers to create clear visual anchors. `body-lg` is the default for interactive list items to ensure they are easily readable at arm's length.

## Layout & Spacing

This design system employs a **Tight Fluid Grid** optimized for single-screen "at-a-glance" density. To achieve zero-scroll, vertical padding is compressed while maintaining horizontal "breathability."

- **Grid:** A 4-column grid for mobile/handheld and a 12-column grid for tablet/in-cab displays.
- **Density:** Use `md` (16px) for external card margins and `sm` (8px) for internal element grouping.
- **Touch Integrity:** Despite the high density, all interactive elements must maintain a minimum 44x44px touch zone. If visual elements are smaller (e.g., a small toggle), the invisible hit area must expand to meet this requirement.
- **Reflow:** On tablets, the layout splits into a 1/3 sidebar (Map/Status) and 2/3 main area (Action List). On mobile, these stack with a persistent glassmorphic bottom-sheet.

## Elevation & Depth

Visual hierarchy is managed through **Tonal Layering** and **Apple-inspired Glassmorphism**.

1.  **Base Layer:** Solid `#F8F9FA` background.
2.  **Card Layer:** Pure white (`#FFFFFF`) with a subtle 1px stroke (`#E9ECEF`) and no shadow. This creates a "flat-plus" look that stays crisp under sunlight.
3.  **Overlay Layer:** Used for modals, stop-details, or critical alerts. Use a background blur (20px) with a semi-transparent white fill (opacity 80%). This allows the driver to maintain a sense of their location in the app while focusing on the task at hand.
4.  **Active State:** Use a 4px Deep Emerald left-border on cards to indicate the "Current" or "Active" task, rather than heavy drop shadows which can muddy the UI in high-brightness settings.

## Shapes

The shape language is "Robust-Soft." While the system uses a base roundedness of `0.5rem` for standard inputs and buttons, **Cards** and **Main Containers** utilize `rounded-xl` (1.5rem). This high corner radius on large containers helps differentiate between the "housing" of the app and the "content" within it, creating a modern, friendly, yet professional feel. Buttons should remain `rounded-lg` (1rem) to appear as distinct, clickable "pills."

## Components

- **Buttons:** Primary buttons use a solid Deep Emerald fill with White `label-bold` text. They must be exactly 48px or 56px in height for easy thumb-triggering.
- **Cards:** The workhorse of the system. Cards feature `rounded-xl` corners, a 1px Slate Gray stroke, and internal `md` (16px) padding. Metadata within cards should use `label-sm` in a medium gray.
- **Glass Overlays:** Bottom sheets and top bars use a `backdrop-filter: blur(20px)` and an 80% white tint. They include a "grabber" handle at the top for sheet expansion.
- **Status Chips:** Small, high-contrast badges with `0.25rem` radius. Use Tertiary Emerald background with Primary Emerald text for "Complete," and Warning Yellow for "Pending."
- **Input Fields:** Large, 56px height fields with 16px internal padding. Labels are persistent and positioned above the field in `label-bold` to ensure context is never lost during data entry.
- **List Items:** High-density rows with a minimum height of 64px, featuring trailing chevron icons to indicate drill-down capability.