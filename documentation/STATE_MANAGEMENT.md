# State Management

✅ **Status**: Implemented

## Server State (TanStack React Query)
Used for all async data fetching outside of React Server Components.
- **Why:** Handles caching, background refetching, and optimistic updates seamlessly.
- **Config (`providers/query-provider.tsx`):**
  - `staleTime: 5 * 60 * 1000` (5 minutes). Heavily limits Supabase reads.
- **Example:** `useCitizenDashboard.ts` fetches RPC data and caches it under the `['citizen-dashboard', citizenId]` key.

## Global Client State (Zustand)
Used for synchronous, complex UI state that spans multiple components.
- **Why:** Lighter and less boilerplate than Redux. Does not require Context Providers.
- **Stores:**
  - `map.store.ts`: Controls Mapbox zoom, center coordinates, and manual override modes.
  - `sidebar.store.ts`: Controls mobile navigation and desktop sidebar toggles.
  - `auth.store.ts`: Caches local user metadata to prevent prop-drilling.

## Form State (React Hook Form)
- Used in conjunction with `zod` for rigorous schema validation.
- Prevents unnecessary re-renders during keyboard input.

## Persistence
- Critical state (like the Citizen's tagged GPS Home Location in `useProximityTracking.ts`) is persisted to browser `localStorage` to survive page reloads.
