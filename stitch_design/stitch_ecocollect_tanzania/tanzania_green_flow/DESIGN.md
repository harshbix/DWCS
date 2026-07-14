---
name: Tanzania Green Flow
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#404943'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#4c6452'
  on-secondary: '#ffffff'
  secondary-container: '#cce6d0'
  on-secondary-container: '#506856'
  tertiary: '#004691'
  on-tertiary: '#ffffff'
  tertiary-container: '#005dbd'
  on-tertiary-container: '#cadaff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#cee9d3'
  secondary-fixed-dim: '#b3cdb7'
  on-secondary-fixed: '#092012'
  on-secondary-fixed-variant: '#354c3b'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#abc7ff'
  on-tertiary-fixed: '#001b3f'
  on-tertiary-fixed-variant: '#00458f'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -1px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.5px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 20px
  gutter: 16px
  card-padding: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built on a foundation of trust, environmental stewardship, and modern efficiency. It adapts the "California Modern" aesthetic to the Tanzanian waste management landscape, prioritizing clarity, transparency, and a premium user experience that dignifies essential utility services.

The design style is **Modern Corporate / Minimalist**, heavily influenced by Apple’s HIG (Human Interface Guidelines). It utilizes high-quality whitespace, a crisp photographic style showcasing local impact, and a sophisticated layering system. The goal is to make waste management feel as innovative and essential as high-end consumer electronics.

## Colors

This design system uses a palette that balances environmental health with digital precision. 

- **Primary (Vibrant Sustainable Green):** Used for primary actions, success states, and brand-critical touchpoints.
- **Secondary (Soft Mint):** Used for large surface areas, subtle highlighting, and background tints to reduce visual fatigue.
- **Tertiary (Professional Blue):** Reserved exclusively for high-trust interactions: payments, real-time GPS tracking, and verification badges.
- **Neutrals:** Crisp White (#FFFFFF) is the primary surface color. Modern Gray (#F8F9FA) serves as the base canvas to allow white cards to "pop." Deep Charcoal (#1D1D1F) is used for high-contrast typography, ensuring maximum readability under varied lighting conditions.

## Typography

The typography strategy employs **Plus Jakarta Sans** for headlines to provide a soft, welcoming, yet modern character, while **Inter** is utilized for body text and functional labels due to its exceptional legibility on mobile screens.

- **Scale:** High contrast between headlines and body text creates a clear information hierarchy.
- **Color:** Headlines should always use the Deep Charcoal (#1D1D1F). Secondary body text should use a 60% opacity of the neutral color to create hierarchy without introducing new hues.
- **Alignment:** Left-aligned text is preferred for all service descriptions and data entries to maintain a clean vertical axis.

## Layout & Spacing

This design system follows a **Fixed-Fluid Hybrid** model optimized for mobile-first deployment.

- **Grid:** A 4-column mobile grid with 20px outside margins and 16px gutters.
- **Rhythm:** An 8px linear scale (8, 16, 24, 32, 48, 64) governs all padding and margins. 
- **Safe Areas:** Adherence to iOS/Android safe areas is mandatory. Top-level views should feature a large title header that collapses into a standard navigation bar upon scroll, mimicking the native Apple behavior.
- **Visual Breathing Room:** Use generous vertical spacing (32px+) between distinct functional sections to prevent the UI from feeling "industrial" or cluttered.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Ambient Shadows**.

- **Surface 0:** The base background (Modern Gray #F8F9FA).
- **Surface 1:** Primary interactive cards (White #FFFFFF). These use a refined shadow: `0 4px 20px rgba(0,0,0,0.05)`.
- **Surface 2:** Floating elements or active states. These may use a slightly more pronounced shadow `0 8px 30px rgba(0,0,0,0.08)` to indicate higher elevation.
- **The "Glass" Effect:** For bottom navigation bars and top headers, use a backdrop-blur (saturate 180%, blur 20px) with a semi-transparent white background (80% opacity) to maintain context of the content underneath.

## Shapes

The shape language is "Squircle-adjacent," emphasizing safety and approachability.

- **Cards & Containers:** Use a 24px corner radius (`rounded-xl` equivalent) for primary dashboard cards.
- **Buttons:** Use a 16px corner radius for standard buttons.
- **Small Elements:** Chips, tags, and input fields use a 12px corner radius.
- **Icons:** Use 2pt stroke weight with rounded caps and joins to match the soft UI corners.

## Components

### Buttons
- **Primary:** Solid #2D6A4F with White text. High-gloss feel without gradients.
- **Secondary:** Solid #D8F3DC with #2D6A4F text. Used for "Cancel" or "View Details."
- **Ghost:** No background, #0071E3 text. Used for tertiary actions like "Learn More."

### Cards
Cards are the primary vehicle for information. They must always have a white background, the defined soft shadow, and a 24px border radius. Padding inside cards is strictly 24px.

### Input Fields
Inputs use a light gray stroke (1px) that transitions to the Professional Blue (#0071E3) on focus. Labels should be small and positioned above the field in 14px Inter Semibold.

### Chips & Status Indicators
- **Pending:** Soft Yellow background with Brown text.
- **Completed:** Soft Green (#D8F3DC) background with Primary Green text.
- **Active Tracking:** Soft Blue background with Professional Blue text.

### Progress Tracking
A custom "Waste Lifecycle" vertical stepper component should be used, featuring thin line-based icons (e.g., Collection -> Sorting -> Recycling) to show users the impact of their waste disposal in real-time.