# Map System

✅ **Status**: Implemented

The EcoCollect tracking system is built on **Mapbox GL JS**, chosen for its extreme performance with vector tiles and large dataset rendering.

## Architecture & Integration
- **Component:** `components/map/mapbox-map.tsx` wraps the vanilla Mapbox GL JS engine.
- **Dynamic Loading:** It is imported via Next.js `dynamic` with `ssr: false` to ensure browser APIs (like WebGL) are available.
- **State Integration:** The React wrapper consumes `useMapStore` (Zustand) to sync external UI controls (Zoom In/Out, Recenter) with the Mapbox camera instance.

## Tracking & Markers
- **Realtime Movement:** The `useVehicleSimulation.ts` hook simulates movement toward the citizen. In production, this data comes from Supabase Realtime subscriptions to the `vehicle_current_location` table.
- **Custom DOM Markers:** Trucks are rendered using highly styled HTML markers injected into Mapbox. They feature a CSS `pulse-ring` animation to simulate live radar tracking.

## Performance: Viewport Culling
- Mapbox markers can be expensive if thousands are rendered simultaneously.
- **Optimization:** The component actively listens to the map's `move` event. It calculates the current bounding box (`map.getBounds()`) and completely unmounts/destroys markers that fall outside the visible screen. When panned back, they are re-instantiated.

## Geolocation & Proximity
- The `useProximityTracking.ts` hook handles the heavy math.
- It uses the **Haversine formula** to calculate the great-circle distance between the user's `homeLocation` and the active truck's `[lat, lng]`.
- Based on speed, it also calculates a live ETA in minutes.
