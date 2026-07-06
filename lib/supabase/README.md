# Supabase Client Directory

This directory contains specialized configurations to connect to Supabase under various Next.js lifecycle contexts:

- `browser.ts` - Used in Browser/Client Components.
- `server.ts` - Used in React Server Components, Server Actions, and Route Handlers. Automatically accesses and modifies HTTP cookies.
- `middleware.ts` - Used inside Next.js edge middleware to inspect and refresh auth sessions during routing.
- `admin.ts` - Elevated admin-access client (bypasses RLS). Loaded strictly on the server-side.
