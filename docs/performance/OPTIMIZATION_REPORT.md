# Optimization Report

## Problem
Page load latency and resource queries slowed down the initial render speed on Tanzanian networks.

## Root Cause
- Heavy index file fetches for map assets.
- Uncached route configurations.

## Fix
- Added Leaflet Map tile caching inside the PWA Service Worker (`sw.js`).
- Implemented stale-while-revalidate caches for static client bundles.
- Reduced database payload sizes by selecting only required columns.

## Files Modified
- [sw.js](../public/sw.js)
- [middleware.ts](../middleware.ts)

## Performance Gain
- Offline map rendering support.
- Bundles load instantly from cache storage on subsequent hits.

## Risk Assessment
Low. Caching strategies fallback to network fetch when unavailable.

## Validation
Verified PWA install prompts and offline cache access.
