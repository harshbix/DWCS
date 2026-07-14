# Database Documentation

✅ **Status**: Implemented

The database is built on **PostgreSQL** hosted via Supabase. It uses a highly normalized schema with strict Row Level Security (RLS) policies.

## Core Tables

### User Management
- **`profiles`:** Base table linking to `auth.users`. (Columns: `id`, `full_name`, `phone`, `avatar_url`).
- **`roles` & `user_roles`:** Enforces RBAC (Citizen, Driver, Admin).

### Logistics & Maps
- **`regions`, `districts`, `wards`, `streets`:** Hierarchical geolocation tables.
- **`vehicles`:** Fleet metadata (`plate_number`, `capacity_tons`).
- **`routes` & `route_stops`:** Defines the physical path a truck must take.
- **`collection_schedules`:** Connects a `route`, a `vehicle`, and a specific date.

### Telemetry (High Volume)
- **`vehicle_current_location`:** Live GPS coordinates of active trucks. Extensively queried by the Realtime engine.
- **`vehicle_location_history`:** Append-only log of historical movements. *Partitioned for performance.*

### Business Logic
- **`complaints`:** Citizen-reported issues (`lat`, `lng`, `description`, `image_url`, `status`).
- **`billing` & `payment_transactions`:** Financial ledger mapping generated bills to GePG payments.

## Performance & Indexing
- **Composite B-Tree Indexes:** Applied to heavily queried foreign key pairs (e.g., `user_id` + `status` on the `billing` table).
- **GiST Indexes:** Applied to geolocation coordinates (`lat`, `lng`) to accelerate spatial calculations.

## Row Level Security (RLS)
Every table enforces RLS.
- *Citizens* can only `SELECT` from `billing` where `billing.citizen_id = auth.uid()`.
- *Drivers* can only `UPDATE` `vehicle_current_location` if assigned to that vehicle.
- *Service Role* (Express backend) bypasses RLS for system operations.
