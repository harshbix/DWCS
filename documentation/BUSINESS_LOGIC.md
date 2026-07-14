# Business Logic Workflows

✅ **Status**: Implemented

## 1. Waste Collection Flow
- **Scheduling:** Admins create `collection_schedules` associating a specific `vehicle`, `route`, and `date`.
- **Driver Dispatch:** A driver logs in, views their active schedule, and clicks "Start Route". This initiates continuous GPS broadcasting to `vehicle_current_location`.
- **Citizen Preparation:** Citizens check the schedule. As the assigned truck begins its route, citizens track it via the Mapbox interface.
- **Proximity Alert:** When the truck crosses the 5km radius to a citizen's tagged home location, the system fires an alert ("Put your bins out!").
- **Collection:** The driver arrives, collects the waste, and marks the stop as complete on their app.

## 2. Payments & Billing
- **Bill Generation:** Bills are periodically inserted into the `billing` table for citizens.
- **Payment Gateway:** A citizen initiates payment. The system generates a GePG Control Number.
- **Reconciliation:** The citizen pays via mobile money. The gateway fires a webhook to the Express backend (`/api/payments/callback`), which updates the transaction status and marks the bill as `paid`.

## 3. Issue Reporting (Complaints)
- A citizen spots illegal dumping. They open the complaints tab, snap a picture, and submit.
- The photo uploads to Supabase Storage, and a record is created in `complaints` with their current GPS coordinates.
- Admins view the complaint on a heat map and dispatch a cleanup team.

## 4. Rewards (Gamification)
- 🔵 **Status:** Planned.
- **Logic:** Citizens earn "EcoPoints" for timely payments, recycling sorting, and verified community cleanup reports. Points will offset future bills.
