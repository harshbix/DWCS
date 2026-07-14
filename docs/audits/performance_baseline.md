# EcoCollect Tanzania — Performance Baseline (Pre-Phase 2)

## 1. Build & Bundle Sizes
*Based on `npm run build` output (Next.js 15)*
- **Global Shared First Load JS**: 103 kB
- **Largest Client Route JS (First Load)**:
  - `/admin`: 243 kB (Largest due to Recharts / Maps / Dashboard UI)
  - `/citizen`: 243 kB (Leaflet Maps + Framer Motion)
  - `/admin/citizens`, `/driver`, `/citizen/payments`: ~200 - 204 kB
- **Smallest Route JS**:
  - `/landing`: 146 kB
  - `/offline`: 112 kB
- **Total Initial Framework Chunks**: ~103 kB

## 2. Component & Rendering Metrics
- **Largest React Trees**:
  - `AdminInteractiveDashboard` (heavy with Recharts and multiple UI widgets)
  - `CitizenInteractiveDashboard` (Spring physics via Framer Motion, Leaflet rendering)
- **Hydration Duration**: Noticeable delay (~200ms) on low-end devices due to fetching client-side scripts for large Leaflet maps and initializing framer motion variants on page load.
- **RSC Status**: The shell structure of `/admin` and `/citizen` are now Server Components, but the interactive children are still massive client components.

## 3. Database & Network Queries Baseline
- **Slowest RPCs (Identified)**:
  - `v1_get_admin_dashboard`: Scans multiple tables (citizens, drivers, vehicles, billing, complaints) simultaneously.
  - `v1_get_citizen_dashboard`: Scans bills and schedules.
- **Slowest Database Queries**:
  - Retrieving `user_roles` mapped to `profiles` (requires JOIN across Auth, Profiles, and Roles).
  - Retrieving location history (potential sequential scan without proper partition/time indexes).
- **Number of Supabase Queries Per Page**:
  - Dashboard routes average **3-4 queries** (1: Auth User, 2: Profile, 3: Dashboard RPC, 4: Extraneous lookups like roles/organization).
- **Number of Realtime Subscriptions**:
  - **1 per Active Citizen Page**: Subscribes to `vehicle_current_location` for ETA.
  - **1 per Active Driver Page**: Subscribes to assignments.

## 4. Current Bottlenecks (Identified for Fix)
1. **Duplicate Data Fetching**: `useAuth()` queries `profiles` and `user_roles`, but `app/(admin)/admin/page.tsx` also fetches `profiles` directly.
2. **Sequential Awaits**: Server components await user, then await profile, then await dashboard data consecutively instead of concurrently.
3. **Over-fetching**: Leaflet, Charts, and Framer Motion are loaded eagerly instead of lazily.
4. **Lack of DAL**: Queries are scattered across React components and hooks, making caching and sharing `Promises` difficult.
