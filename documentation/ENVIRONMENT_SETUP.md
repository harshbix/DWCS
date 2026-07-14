# Environment Setup

✅ **Status**: Implemented

All required environment variables for the system. **Never commit `.env.local` to version control.**

## Frontend Variables (`.env.local`)

| Variable | Purpose | Status | Security Risk |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint for Supabase. | Required | Low (Public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public access key for Supabase client. | Required | Low (Restricted by RLS) |
| `NEXT_PUBLIC_API_URL` | URL of the Express backend (e.g., `http://localhost:5000`). | Required | Low (Public routing) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Access token for Mapbox GL JS rendering. | Required | Medium (Can be quota-abused if not domain-restricted) |

## Backend Variables (`backend/.env`)

| Variable | Purpose | Status | Security Risk |
| :--- | :--- | :--- | :--- |
| `PORT` | Express server port. | Optional (Default: 5000) | Low |
| `SUPABASE_URL` | Same as frontend. | Required | Low |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated key that bypasses Postgres RLS. | Required | **CRITICAL** (Total database access) |
| `DATABASE_URL` | Direct connection string to PostgreSQL (for heavy queries). | Required | **CRITICAL** (Direct DB access) |
| `CORS_ORIGIN` | Allowed domains for the Express API. | Required | Medium |

## Deployment Usage
- In Vercel (Frontend), add the `NEXT_PUBLIC_*` variables to the Project Settings.
- In Railway/Render (Backend), add all Backend variables. Ensure `SUPABASE_SERVICE_ROLE_KEY` is kept strictly as a Server Secret.
