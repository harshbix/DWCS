# API Documentation

✅ **Status**: Implemented

## Supabase RPC Endpoints (Frontend API)

### `rpc('v1_get_citizen_dashboard')`
- **Purpose:** Aggregates all necessary data for the Citizen Home Dashboard in a single round-trip.
- **Input:** `{ p_citizen_id: string }`
- **Output:** `{ profile, recent_bills, next_schedule }`
- **Authentication:** Requires valid JWT. Validated via RLS.

### `rpc('v1_get_admin_metrics')`
- **Purpose:** Retrieves fleet-wide analytics and revenue totals.
- **Input:** None.
- **Output:** `{ total_collected, active_trucks, pending_complaints }`
- **Authentication:** Requires Admin Role JWT.

## Express.js REST Endpoints (`/backend`)

### `GET /health`
- **Purpose:** Load balancer target to verify the Express server is running.
- **Output:** `{ status: "ok", timestamp: "..." }`

### `POST /api/payments/callback`
- **Purpose:** Webhook target for GePG / Mobile Money providers.
- **Input:** Payload containing `control_number`, `amount`, `status`, `receipt`.
- **Authentication:** Basic Auth / IP Whitelisting (Depends on payment provider specs).
- **Logic:** Verifies the transaction, updates the Supabase `payment_transactions` table using the `SERVICE_ROLE_KEY`.
