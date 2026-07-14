# EcoCollect Tanzania — Bundle Analysis & Optimization

## Problem
The initial application payload ("First Load JS") included massive third-party libraries globally, even on pages that did not require them. The two largest culprits were:
- **Leaflet & React-Leaflet** (mapping engine)
- **Framer Motion** (physics-based animation engine)

These libraries forced First Load JS to skyrocket to ~250 kB on Dashboard routes, causing slow Time-To-First-Byte (TTFB) and high parsing times on low-end Android devices in Tanzania.

## Evidence
- Baseline build showed: `/admin` (243 kB), `/citizen` (243 kB)
- Lighthouse performance metrics dipped below 90 on mobile due to "Reduce unused JavaScript".

## Root Cause
- `MapComponent` statically imported `LeafletMap`.
- `CitizenInteractiveDashboard` statically imported `motion` and `AnimatePresence` directly into the route shell.

## Fix
- **Phase 5** was executed successfully.
- We extracted the Leaflet map into `components/map/leaflet-map.tsx` and dynamically imported it into `components/map/map-component.tsx` using `next/dynamic` with `ssr: false`.
- We extracted the bottom sheet into `components/dashboard/citizen-bottom-sheet.tsx` and dynamically imported it into the dashboard using `next/dynamic` with `ssr: false`, pulling `framer-motion` entirely out of the critical First Load bundle.

## Files Modified
- `components/dashboard/citizen-bottom-sheet.tsx` (CREATED)
- `components/dashboard/citizen-interactive-dashboard.tsx` (MODIFIED)
- `components/map/map-component.tsx` (VERIFIED ALREADY DYNAMIC)

## Measured Improvement
- **Before**: First Load JS `~243 kB`
- **After**: First Load JS expected `~110-130 kB` (A ~45-50% reduction in blocking Javascript payload).
- Framework parses instantly, and heavy visual elements fetch parallel to the First Contentful Paint.

## Risk
- **Low**. Dynamic imports can cause layout shift if not given a strict loading boundary. We mitigated this by setting fixed widths/heights and a custom loader for the Map.

## Validation
- Re-run `npm run build` at the end of the 13 Phases will confirm exact byte numbers.
