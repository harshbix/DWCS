# Network Performance Audit

## 1. Network Payload & Roundtrips
* **Middleware DB Queries**: Checking the database in Next.js middleware blocks the initial document load. On unstable networks (2G/3G in Tanzania), this adds up to 500ms of latency before the server can even respond.
* **Large UI Bundles**: Next.js does not split the citizen sub-routes (`/citizen/schedule`, `/citizen/payments`, etc.) into dynamic chunks. A single large JS payload is loaded.
* **Lack of Request Caching**: Every mount of the driver or citizen portal triggers full API fetches without check caches. If connections drop, the client displays a blocking error boundary.

## 2. API Call Density per Screen
* **Citizen Screen**: 1 full aggregation query (`v1_get_citizen_dashboard`), which downloads all historical bills, schedules, and complaints.
* **Driver Screen**: 1 full driver dashboard query (`v1_get_driver_dashboard`), plus individual fetches when loading tracking status.
* **Admin Screen**: Polls vehicle coordinates every 10-15 seconds, downloading full metadata blocks instead of just delta coordinates.

## 3. Slow Internet Optimizations (Targeted)
* Implement static cache assets via a Service Worker.
* Switch vehicle location polling from full queries to lightweight Supabase Realtime channels.
* Introduce local caching (staleTimes) to prevent reloading on page transitions.
