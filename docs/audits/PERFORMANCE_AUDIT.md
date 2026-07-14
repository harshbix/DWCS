# EcoCollect Tanzania — Performance & RSC Audit

## 1. Current Architecture Bottlenecks

### 1.1 Heavy Client Components
The main layout pages (`app/(citizen)/citizen/page.tsx`, `app/(admin)/admin/page.tsx`, `app/(driver)/driver/page.tsx`) are currently entirely designated as Client Components (`"use client"`). 
- **Impact**: All React Query hooks, Supabase JS client logic, and heavy rendering libraries (Framer Motion, Leaflet map initializers) are included in the First Load JS.
- **Symptom**: Higher Time-to-Interactive (TTI), larger bundle sizes, and a flash of "Skeleton" loading states on every navigation while data is fetched client-side.

### 1.2 Data Fetching Strategy
Data is currently fetched strictly on the client using `@tanstack/react-query`.
- **Impact**: The browser must first download the JS bundle, parse it, run React, and *then* initiate the network request for data, leading to a waterfall effect.

### 1.3 State Management
Context providers (e.g., `<MapProvider>`) wrap the entire page content, which further reinforces that the tree must be executed on the client.

---

## 2. Targeted Improvements & RSC Strategy

### 2.1 Default to React Server Components (RSC)
We will refactor the Next.js App Router pages to execute on the server.
- The `page.tsx` files will fetch initial data using `@supabase/ssr` directly on the server.
- The page will render the layout and pass the pre-fetched data down as props.

### 2.2 Component Isolation
We will isolate interactive parts to use `"use client"`:
- **Leaflet Maps / GPS**: `MapComponent` and hooks needing `navigator.geolocation` or `window`.
- **Animations**: Components using `framer-motion` (e.g., the bottom sheet, dynamic cards).
- **Forms/Interactions**: Real-time subscriptions and buttons (e.g., Payment buttons).

### 2.3 Eliminating Waterfalls with Suspense
For dashboard data that might be slow to load, we will wrap the fetching components in `<Suspense fallback={<SkeletonDashboard />}>`. This allows Next.js to stream the UI frame immediately and send the data-heavy chunks when ready.

### 2.4 Dependency Optimization
We will investigate replacing `axios` with the native `fetch` API, as it integrates perfectly with Next.js 15's native caching and Server Components.

---

## 3. Anticipated Outcomes

- **First Load JS**: Target < 150KB (down from current due to moving React Query/Supabase off initial bundle).
- **Time-to-First-Byte (TTFB)**: Handled by edge caching / SSR.
- **Largest Contentful Paint (LCP)**: Target < 1.8s (by eliminating client-side data waterfall).
- **SEO & Social Previews**: Data will be populated in the HTML response, improving parsing for crawlers.
