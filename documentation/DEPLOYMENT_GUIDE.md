# Deployment Guide

✅ **Status**: Implemented

## Infrastructure Overview

| Subsystem | Recommended Hosting | Reason |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | Vercel | Native App Router support, Edge Middleware, instant ISR invalidation. |
| **Backend (Express)** | Render / Railway | Easy Dockerization, WebSocket support, background workers. |
| **Database & Auth** | Supabase Managed Cloud | Zero-maintenance Postgres, instant Realtime cluster scaling. |

## Pre-Deployment Checklist
1. Generate secure random strings for `SUPABASE_SERVICE_ROLE_KEY`.
2. Configure Allowed CORS origins in Supabase Auth settings to match the Vercel production domain.
3. Lock down Mapbox tokens to the production URL to prevent quota theft.
4. Run standard build (`npm run build`) to ensure no TypeScript or ESLint errors.

## CI/CD Pipeline (GitHub Actions)
A standard deployment pipeline should:
1. Trigger on merge to `main`.
2. Run `npm run lint` and `npx tsc --noEmit`.
3. Push Database Migrations (`supabase db push`).
4. Trigger Vercel Deployment Hook.

## Monitoring & Analytics
- **Vercel Analytics:** Enables Web Vitals tracking (FCP, LCP, CLS) from real users.
- **Sentry:** Recommended for tracking Express backend errors and React boundaries.
- **Supabase Logs:** Monitor Postgres query performance and API request latency via the built-in observability dashboard.

## Scaling Strategy
- The Next.js frontend is functionally stateless and scales infinitely on Edge infrastructure.
- Postgres connections are managed by Supabase Supavisor (connection pooling) to prevent exhaustion during traffic spikes.
