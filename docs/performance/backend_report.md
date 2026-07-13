# Backend Performance Audit

## 1. Database Queries & RPC Performance
* **`v1_get_citizen_dashboard` RPC**: This function aggregates profiles, billing invoices, complaints, and upcoming schedules using multiple subquery joins. It performs multiple nested scans over `collection_schedules`, `routes`, `route_stops`, `collection_stops`, and `citizens`.
* **N+1 Query Potentials**:
  - Fetching vehicle coordinates lists drivers and profiles by fetching them sequentially when RLS filters them out.
  - The tables `profiles`, `user_roles`, `billing`, `payment_transactions`, `notifications`, `vehicle_current_location`, and `collection_schedules` need optimized indexes on their foreign keys.

## 2. Missing Indexes (RLS & Joins)
The following fields do not have explicit indexes:
* `user_roles.profile_id` (used on RLS policies and middleware queries)
* `billing.citizen_id` (used on RLS policies and dashboard queries)
* `payment_transactions.billing_id` (used to query transaction histories)
* `collection_schedules.driver_id` and `collection_schedules.vehicle_id`
* `vehicle_current_location.vehicle_id` (highly hit during live tracking polling)

## 3. Caching Opportunities
* The admin panel tracking screen invalidates and re-queries the entire fleet vehicle list on every location telemetry update. This should be decoupled so that coordinate updates are updated in real-time while static vehicle metadata remains cached.
