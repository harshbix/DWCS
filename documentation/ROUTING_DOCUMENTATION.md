# Routing Documentation

✅ **Status**: Implemented

Next.js 15 App Router architecture.

## Route Map

| Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Landing page / marketing. |
| `/login` | Public | Authentication entry. |
| `/register` | Public | Citizen signup. |
| `/citizen` | Protected (Citizen) | Citizen Home Dashboard. |
| `/citizen/tracking` | Protected (Citizen) | Full-screen Mapbox tracking. |
| `/citizen/payments` | Protected (Citizen) | GePG billing and history. |
| `/citizen/complaints` | Protected (Citizen) | Issue reporting. |
| `/citizen/profile` | Protected (Citizen) | Account settings. |
| `/driver` | Protected (Driver) | Route and active job management. |
| `/admin` | Protected (Admin) | High-level metrics and fleet management. |

## Middleware Protection (`middleware.ts`)
- **Flow:** Every request routes through Next.js Edge Middleware.
- **Logic:** 
  1. Checks for a valid Supabase JWT in cookies.
  2. If missing, forces redirect to `/login`.
  3. If present, reads `user_metadata.role` (or makes a fast DB call if needed) to ensure Role-Based Access Control (RBAC). 
  4. Example: A Citizen attempting to access `/admin` will be redirected to `/citizen`.

## Dynamic Routes
- **404 Pages (`not-found.tsx`):** Customized to match the design system.
- **Error Pages (`error.tsx`):** Catch-all boundaries with "Try Again" functionality.
