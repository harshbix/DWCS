# EcoCollect Tanzania

✅ **Status**: Release Candidate (RC) | 🟡 **Deployment Status**: Pre-Production

EcoCollect Tanzania is a modernized municipal solid waste collection platform designed to bring transparency, real-time tracking, and automated scheduling to the waste management ecosystem in Mbeya, Tanzania.

## Purpose & Vision
The vision is to eradicate uncoordinated, paper-based municipal waste logistics. By providing an integrated digital suite, citizens can accurately anticipate collections, administrators can trace financial and logistical operations, and drivers are empowered with optimized geospatial routing.

## Technologies
* **Frontend Core**: Next.js 15 (React 19), App Router, TypeScript.
* **Styling**: Tailwind CSS v4, Lucide React, Framer Motion.
* **State Management**: Zustand (Global UI), TanStack Query (Server State), React Hook Form (Forms).
* **Database & BaaS**: Supabase (PostgreSQL), Supabase Auth, Storage, Realtime.
* **Geospatial**: Mapbox GL JS (Vector maps, rendering, culling).
* **Backend API**: Node.js / Express (for specialized webhooks and secure off-chain transactions).

## Folder Overview
* `/app` - Next.js routing and server/client components.
* `/backend` - Express.js API for secure server-side integrations.
* `/components` - Reusable UI, map, and dashboard components.
* `/documentation` - Comprehensive system documentation and audits.
* `/hooks` - Custom React hooks for proximity, auth, and data fetching.
* `/lib` - Core Supabase clients, Realtime broadcast abstractions.
* `/supabase/migrations` - PostgreSQL schema, indexes, and RLS definitions.

## Installation & Running Locally

1. **Clone the repository.**
2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd backend && npm install
   ```
4. **Environment Variables:**
   Copy `.env.example` to `.env.local` in the root, and configure the Supabase and Mapbox keys.
5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *This starts the Next.js frontend on `http://localhost:3000`.*

## Current Project Status
- ✅ **Authentication**: Fully implemented via Supabase SSR.
- ✅ **Database**: Schemas, composite indexes, and RLS fully defined.
- ✅ **Frontend**: UI rebuilt to match prototype designs.
- ✅ **Map Tracking**: Real-time Haversine proximity tracking implemented.
- 🟡 **Payment Webhooks**: Core logic exists, pending real GePG integration.

## Known Limitations
- The system heavily relies on client-side GPS (Geolocation API) which can degrade inside buildings.
- Push notifications rely on native Web APIs which are restricted in some iOS WebView configurations.

For deeper architectural dive, see the [Documentation Hub](./documentation/INDEX.md).
