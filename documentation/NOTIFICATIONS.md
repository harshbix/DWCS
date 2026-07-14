# Notifications

✅ **Status**: Implemented

The platform ensures citizens and drivers are constantly informed via an escalating notification architecture.

## 1. Browser Push Notifications
- **Trigger:** Proximity HUD (Truck is < 5km away).
- **Implementation:** Uses the native HTML5 `Notification` API.
- **Flow:** 
  1. The user tags their home location.
  2. The browser prompts for Notification permissions.
  3. When the Haversine distance drops below 5km, `fireProximityAlert()` constructs a system-level notification.
  4. A `tag` property (`truck-proximity`) is used to prevent spam by replacing existing notifications rather than stacking them.

## 2. In-App Toasts
- **Library:** Custom implementation in `utils/toast.ts` (or standard `sonner`/`react-hot-toast` wrapper).
- **Usage:** Used as a fallback if the user denies Push Notifications, or for standard UI feedback (e.g., "Location Saved", "Payment Processing").

## 3. Realtime Updates
- The UI itself acts as a notification layer. Using Supabase Realtime, the Dashboard UI updates instantly (e.g., "Truck Status: In Transit" -> "Collecting Waste") without requiring page reloads.

## 4. Missing / Future Implementations
- 🔴 **Email:** Transactional emails (e.g., Payment Receipts) via Resend or SendGrid are pending.
- 🔴 **SMS:** Critical for regions with low smartphone penetration. Integration with Twilio or Africa's Talking is planned for billing reminders.
