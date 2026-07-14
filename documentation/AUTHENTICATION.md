# Authentication

✅ **Status**: Implemented

The system utilizes **Supabase Auth (GoTrue)** for secure identity management.

## Authentication Flow
1. **Login/Registration:** Users submit credentials on the `/login` or `/register` route.
2. **Supabase Response:** A JWT session is returned.
3. **Cookie Storage (`@supabase/ssr`):** The Next.js Route Handler captures the session and writes it to an `HttpOnly` cookie. This prevents XSS attacks from stealing the token.
4. **Server Component Reads:** React Server Components read the cookie to identify the user before rendering HTML.

## Authorization & Roles
Role-Based Access Control (RBAC) is implemented at the database level.
- Upon registration, a trigger assigns the default `citizen` role in the `user_roles` table.
- A Postgres function `get_user_role()` is used inside Row Level Security (RLS) policies to ensure that API requests only return authorized rows.

## Middleware (`middleware.ts`)
- Automatically refreshes stale tokens by calling `supabase.auth.getUser()`.
- Acts as a gatekeeper. If an unauthenticated user attempts to access `/citizen`, `/driver`, or `/admin`, they are immediately redirected to `/login` with a `?next=` parameter.

## Security Considerations
- Passwords are never sent to the Express backend.
- Database access is strictly bound by RLS policies; even if an attacker manipulates the client-side API calls, the Postgres database will reject unauthorized read/writes.
