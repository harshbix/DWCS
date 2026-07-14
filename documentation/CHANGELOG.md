# Changelog

All notable changes to the EcoCollect Tanzania project will be documented in this file.

## [v1.0.0-rc.1] - July 2026

### Architecture Milestones
- Established strict separation of React Server Components and Client Components within the Next.js App Router.
- Finalized migration to Supabase SSR for secure, HttpOnly cookie-based JWT management.
- Replaced legacy map tracking with high-performance `mapbox-gl` wrapper featuring viewport culling.

### UI Changes
- Complete design system overhaul transitioning to the "Mbeya Green" (`#0f5238`) color palette.
- Replaced basic HTML tables and forms with custom Radix-style UI components in `components/ui/`.
- Introduced `ProximityHUD` with live Haversine distance calculations and Framer Motion fluid animations.
- Replaced the old "On Route" dashboard widget with a real-time responsive tracking component.

### Database Changes
- Dropped legacy schema structure and deployed `20260708000000_init_schema.sql` implementing full RLS.
- Applied `20260712000000_perf_indexes.sql` to introduce GiST indices for geospatial queries and composite B-Trees for billing joins.

### Backend Changes
- Deployed Express.js scaffolding in `/backend`.
- Addressed `tsc` compiler warnings (`toast.warn` type fix).

## Future Releases
- **[v1.0.0-rc.2]** will focus entirely on implementing the automated testing suite and CI/CD pipelines.
- **[v1.0.0]** will mark the official deployment to production servers with real GePG integrations.
