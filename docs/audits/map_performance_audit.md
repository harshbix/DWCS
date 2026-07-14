# EcoCollect Tanzania — Map Performance Audit

## Current Architecture Analysis
The current application relies on a standard heavy web-mapping architecture using **Leaflet**.

### 1. Current Map Technology
- **Library**: `leaflet` (Direct DOM manipulation via `components/map/leaflet-map.tsx`).
- **React Wrapper**: Custom wrapper using `next/dynamic` in `components/map/map-component.tsx`.

### 2. External Dependencies
- **Tile Provider**: CartoDB Voyager (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`).
- **Routing Engine**: Project OSRM (`https://router.project-osrm.org/route/v1/driving/...`) for road-snapping vehicle positions.

### 3. Why It Is Slow (Performance Impact)
- **Massive Network Requests**: A single map load triggers ~15-30 HTTP requests just to fetch the `.png` tile images for the CartoDB basemap. When panning or zooming, this creates continuous network waterfall requests, completely saturating 2G/3G connections.
- **External API Latency**: The OSRM routing engine requires HTTP calls to an external server just to draw a line between the truck and the user, causing visual delay and tracking stutter on slow connections.
- **Memory & DOM Pressure**: Leaflet creates hundreds of `<img>` DOM nodes to stitch the map together. This causes heavy raster decoding on low-end Android devices, leading to battery drain, jank, and scrolling lag.
- **Bundle Size**: Even though Leaflet is lazy-loaded (`ssr: false`), downloading its ~40KB JS payload plus CSS still blocks interactivity for users on poor connections.

### 4. Components Impacted
- `components/map/leaflet-map.tsx` (Core Leaflet logic, OSRM routing, markers).
- `components/map/map-component.tsx` (Dynamic importer and HUD overlay).
- `components/dashboard/citizen-interactive-dashboard.tsx` (Renders the map).
- `components/dashboard/driver-interactive-dashboard.tsx` (Renders the map).

## Conclusion
The current Leaflet + CartoDB + OSRM setup provides a realistic map but is **fundamentally incompatible** with the requirement of offline capability, extreme speed, and iOS-level smoothness on Tanzanian 2G/3G networks. 

To achieve an "Apple Maps / Tesla Navigation" premium feel without the network overhead, we must replace the raster tile map with a **Local Canvas/SVG Simulation Component**.

---
*Status: Audit Complete. Proceeding to Phase 2 (Local Simulation Replacement).*
