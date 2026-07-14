---
name: Field Efficiency Engine
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#404943'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
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
  tertiary: '#005337'
  on-tertiary: '#ffffff'
  tertiary-container: '#106d4b'
  on-tertiary-container: '#98ebc0'
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
  tertiary-fixed: '#a0f4c8'
  tertiary-fixed-dim: '#85d7ad'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
---

## Brand & Style
The design system is engineered for the Tanzanian Municipal Waste Authority, balancing authoritative governance with modern operational efficiency. The brand personality is **reliable, civic-minded, and technologically advanced**. 

The visual style follows a **Corporate Modern** framework with high-density information architecture. It incorporates **Glassmorphism** specifically for elevated layers—such as modals, popovers, and slide-outs—to maintain context of the underlying data. This approach ensures that the "Field Efficiency Engine" feels like a powerful, transparent tool for public service, evoking a sense of trust and precision.

## Colors
The palette is rooted in **Emerald Green**, symbolizing environmental stewardship and growth. 
- **Primary Emerald (#2d6a4f):** Used for primary actions, active states, and brand reinforcement.
- **Deep Slate Neutrals:** Used for the sidebar and high-contrast typography to ensure a "government-grade" seriousness.
- **Semantic Colors:** High-saturation tones for immediate recognition of system alerts, waste collection status, and fleet health.
- **Gradients:** Data visualizations should utilize subtle linear gradients of the primary green (from #2d6a4f to #52b788) to provide depth without sacrificing legibility.

## Typography
This design system utilizes **Plus Jakarta Sans** for all primary interfaces. Its soft yet geometric curves provide a modern, approachable feel while maintaining the cleanliness required for dense SaaS dashboards.

- **Headlines:** Use Bold weights for clear section hiearchy.
- **Data Display:** For tabular data and IDs, a secondary monospaced font (JetBrains Mono) is recommended to ensure character alignment.
- **Labels:** All-caps styling with 5% letter spacing is reserved for small utility labels and table headers to distinguish them from interactive content.

## Layout & Spacing
The layout is optimized for a **1440px desktop environment** using a structured fixed-navigation model.

- **Sidebar:** A fixed 280px sidebar persists on the left, containing the primary navigation. It may collapse to 80px (icon-only) to maximize data workspace.
- **Top Bar:** A 64px utility bar handles global search, notifications, and profile management.
- **Grid:** Content is housed within a 12-column grid. KPI cards typically span 3 columns (4 per row), while primary data tables span 12 columns.
- **Padding:** A consistent 24px (lg) margin is applied to the main content container to ensure "breathability" in data-heavy views.

## Elevation & Depth
The design system employs a tiered elevation strategy to manage complexity:

1.  **Canvas (Level 0):** The background layer, using a subtle off-white (#f8f9fa).
2.  **Flat Surfaces (Level 1):** Main content cards and data tables. These use a 1px solid border (#e9ecef) instead of shadows to maintain a clean, professional look.
3.  **Raised Elements (Level 2):** KPI cards and hover states. These use a soft, localized shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`.
4.  **Glassmorphic Overlays (Level 3):** Modals, dropdowns, and slide-outs. These use a backdrop-blur (12px) with a semi-transparent white fill (80% opacity) and a 1px "shine" border to create a premium, Apple-inspired depth effect.

## Shapes
In line with a "government-grade" aesthetic, the design system utilizes **Soft (0.25rem)** roundedness for standard UI components. This provides a clean, disciplined look without being overly "bubbly."

- **Standard Buttons/Inputs:** 4px (0.25rem) radius.
- **Cards & Containers:** 8px (0.5rem) radius (rounded-lg).
- **Status Chips:** Full pill-shape (999px) to contrast against rectangular data rows.

## Components
- **Data Tables:** High-density rows (40px height) with zebra-striping. Headers are `label-md` style with Deep Slate backgrounds and light text.
- **KPI Cards:** Feature a "Trend Sparkline" using a subtle gradient fill. The primary metric uses `headline-lg` in Deep Slate.
- **Buttons:** 
    - *Primary:* Solid Emerald Green with white text.
    - *Secondary:* Ghost style with Emerald Green borders.
- **Inputs:** Focused states use a 2px Emerald Green ring with 20% opacity.
- **Charts:** Use a custom palette of Emerald, Slate, and Amber. Avoid 3D effects; use flat vectors with subtle 5% opacity vertical gradients for area charts.
- **Glass Overlays:** Ensure any modal has a `backdrop-filter: blur(16px)` and a thin `1px solid rgba(255, 255, 255, 0.3)` border to catch light.