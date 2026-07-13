# Security & RLS Policy Check

## 1. Row Level Security Verification
Row Level Security (RLS) remains active on all exposed tables inside the `public` schema. There are no open read/write operations (`USING (true)`) or blanket access policies:
* **`profiles`**: Select restricted to owner (`auth.uid() = id`) with administrative overrides via helper checks.
* **`user_roles`**: Select policy restricted to `profile_id = auth.uid()`.
* **`billing`**: Select policy restricted to `citizen_id = auth.uid()`.
* **`payment_transactions`**: Select policy uses join verification via linked billing and citizen ownership.
* **`vehicle_current_location`**: Broadcast telemetry table is write-restricted to drivers and select-exposed to active schedules.

## 2. API Key & Client Secret Audit
* No `service_role` or postgres database secrets are imported in frontend code, layouts, or client-side context hooks.
* Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used for browser clients, whereas server-side operations use isolated server environment clients.

## 3. Database Functions & Privilege Audit
* Functions (including `v1_get_citizen_dashboard`) are audited to verify they use `SECURITY INVOKER` (executing under client auth roles) to prevent SQL injection or privilege escalation vectors.
