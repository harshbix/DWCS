# Frontend Performance Audit

## 1. Identified Rendering Bottlenecks
* **Hydration Mismatch in Greeting**: `getGreeting()` reads `new Date().getHours()` during render execution. This causes server-rendered HTML to differ from the client-rendered DOM, prompting a full hydration warning and component re-render.
* **Mock Map Components**: Maps on all panels (Citizen dashboard, Driver tracking, Admin command center) are mock layouts rendered using static SVG grids. No actual coordinates, routes, or smooth tracking movements are supported.
* **Middleware Overhead**: The Next.js Edge Middleware makes database calls (`supabase.from('user_roles')`) on every portal navigation to verify roles, resulting in blocked page transitions.

## 2. Heavy Dependencies & Bundle Analysis
* **React 19 & Next.js 15**: Fast rendering base, but dynamic routes lack proper code splitting/lazy loading for leaf views like scheduling and payments.
* **Framer Motion**: Heavy runtime animation engine. Needs optimized tree-shaking and spring configurations to avoid page loading freezes on low-tier mobile devices.

## 3. Hydration & State Management
* Current authentication states fetch the User and Profile objects on separate queries. They should be unified or fetched in parallel.
* State is propagated via props rather than context or global Zustand stores for some navigation states.
