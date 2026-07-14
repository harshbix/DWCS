# Frontend Guide

✅ **Status**: Implemented

## Layouts & Pages Architecture
Built using **Next.js 15 App Router**.
- **Root Layout (`app/layout.tsx`):** Injects global fonts, Tailwind CSS, and global Providers (Theme, Query, Auth).
- **Nested Layouts:** Used to wrap protected areas. For example, `app/(citizen)/layout.tsx` ensures that only users with the `citizen` role can render the children, and injects the `MobileBottomNav`.

## Component Strategy
- **React Server Components (Default):** All components in `app/` are Server Components by default. They handle direct Supabase fetches securely without shipping JS to the client.
- **Client Components (`'use client'`):** Explicitly declared for components needing `useState`, `useEffect`, or browser APIs (like Geolocation in `proximity-hud.tsx`).

## Styling & Animations
- **Tailwind CSS v4:** Used exclusively for styling. Standardized via `utils/cn.ts` (clsx + tailwind-merge) to allow clean dynamic classes.
- **Framer Motion:** Used for complex layout transitions. Common patterns (e.g., `fadeUp`) are abstracted to keep components clean.

## Loading & Error States
- **`loading.tsx`:** Next.js convention. Wraps route segments in Suspense boundaries. Uses the `Skeleton` UI component (`/components/ui/skeleton.tsx`).
- **`error.tsx`:** Next.js convention. Catches runtime errors in rendering and provides a retry mechanism (`reset()`). Also mapped to a custom `ErrorDisplay` component.

## Performance Optimizations
- **Compile-on-View (Lazy Loading):** The heavy Mapbox GL JS engine is wrapped in `next/dynamic` and uses `framer-motion`'s `useInView` to prevent instantiation until the user scrolls it into view.
- **Next/Image & Fonts:** Heavily utilized to prevent CLS (Cumulative Layout Shift) and optimize assets.
