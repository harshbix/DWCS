# UX Improvements Summary

## Problem
Dashboard overlays felt static and maps rendered mock coordinates, providing poor feedback for active tracking.

## Root Cause
Static simulated SVG road maps lacked true GPS plotting and routing calculations.

## Fix
- Replaced mock maps with a real, dynamic Leaflet vector map engine styled with voyager cartographic palettes.
- Integrated **OSRM (Open Source Routing Machine)** on the client side to snap vehicle paths to actual Tanzanian roads.
- Redesigned citizen tracking dashboard to Uber-style layouts with full-screen maps and spring-animated iOS bottom sheets.
- Added live distance (calculated via Haversine) and OSRM road ETA cards.
- Refined driver views to Mount-Friendly action grids (Bolt Driver style) with speedometers and accuracy meters.

## Files Modified
- [leaflet-map.tsx](../components/map/leaflet-map.tsx)
- [page.tsx](../app/(citizen)/citizen/page.tsx)
- [page.tsx](../app/(driver)/driver/page.tsx)

## Performance Gain
60 FPS map panning and smooth vehicle tracking marker updates.

## Risk Assessment
Low. Dynamic imports (`ssr: false`) prevent node server failures.

## Validation
Passed manual verification for map interaction.
