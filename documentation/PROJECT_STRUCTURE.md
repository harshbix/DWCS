# Project Structure

✅ **Status**: Implemented

The repository follows a monolithic structure combining the Next.js frontend and the Express backend into a single repository for ease of deployment and shared type safety.

## Root Directories

### `/app`
- **Purpose:** Next.js App Router root. Controls all routing, layouts, and page-level data fetching.
- **Dependencies:** React, Next.js, Supabase SSR.
- **Important Files:** `globals.css` (Tailwind entry), `layout.tsx` (Root HTML/Body), `middleware.ts` (Auth protection).

### `/backend`
- **Purpose:** Standalone Express.js server.
- **Responsibilities:** Webhooks, cron jobs, service-role administrative tasks.
- **Dependencies:** Express, Cors, Supabase JS.
- **Important Files:** `src/server.ts`, `src/routes/`.

### `/components`
- **Purpose:** Reusable React components.
- **Subfolders:**
  - `/ui`: Dumb, highly reusable components (Buttons, Inputs, Cards).
  - `/dashboard`: High-level smart components for specific roles (e.g., `citizen-home-dashboard.tsx`).
  - `/map`: Mapbox integrations (`mapbox-map.tsx`).
  - `/tracking`: Specialized proximity components (`proximity-hud.tsx`).

### `/hooks`
- **Purpose:** Custom React logic.
- **Responsibilities:** Abstracting complex state and side-effects.
- **Important Files:** `useProximityTracking.ts` (Haversine/GPS logic), `useVehicleSimulation.ts`.

### `/lib`
- **Purpose:** Core utility libraries and wrappers.
- **Subfolders:**
  - `/supabase`: Configures browser, server, and admin Supabase clients.
  - `/dal`: Data Access Layer (abstracts DB calls).
  - `/realtime`: Broadcast logic wrappers.

### `/supabase`
- **Purpose:** Source of truth for the Database.
- **Responsibilities:** Schema management, migrations, seeding.
- **Important Files:** `/migrations/20260708000000_init_schema.sql` (Master schema), `seed.sql`.

### `/stores`
- **Purpose:** Zustand global state definitions.
- **Important Files:** `auth.store.ts`, `map.store.ts`.

### `/types`
- **Purpose:** Global TypeScript declarations.
- **Important Files:** `database.ts` (Auto-generated or manually typed Supabase schema interfaces).

## Communication Flow
- Components (`/components`) import Hooks (`/hooks`) and Stores (`/stores`).
- Hooks utilize Lib (`/lib`) and Services (`/services`) to fetch data.
- The `app/` router aggregates Components to construct views.
