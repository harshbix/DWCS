# Bug Report

🟡 **Status**: Tracked | 📅 **Date**: July 2026

## Confirmed Bugs
*(No critical compilation or runtime bugs currently block execution.)*

## Potential Bugs & Edge Cases
| Priority | Issue | Description |
| :--- | :--- | :--- |
| High | Mapbox State Desync | If a user tabs away on mobile Safari, the Mapbox WebGL context may drop, requiring a hard reload to re-render. |
| Medium | LocalStorage Cleared | `useProximityTracking` relies on `localStorage` for home coordinates. If cleared, tracking fails silently without re-prompting the user. |

## Code Smells & Refactoring Needed
| Priority | Issue | Recommended Fix |
| :--- | :--- | :--- |
| Low | Duplicate Map Hooks | `useMapStore` and internal component states occasionally overlap map bounding box logic. |
| Low | `toast.warning` | Was previously causing TS errors; replaced with `toast.warn()`. Keep eye out for other legacy API calls. |

## Architecture Issues
| Priority | Issue | Description |
| :--- | :--- | :--- |
| Medium | Express Server Dependency | Having a separate Node container for 2 endpoints (payments/health) creates unnecessary DevOps overhead. Should be migrated to Supabase Edge Functions. |
