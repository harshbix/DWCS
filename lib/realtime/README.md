# Realtime Services Directory

This directory contains configuration interfaces and class controllers preparing for **Supabase Realtime** streaming:

- `client.ts` - Instantiates channel instances from the browser Supabase connection.
- `connection.ts` - Orchestrates subscribe/unsubscribe lifecycles and tracks connection statuses.
- `broadcast.ts` - Triggers client-to-client events over channel pipes.
- `presence.ts` - Monitors concurrent user sync collections via Supabase Presence tracking.
- `hooks.ts` - Custom React listener templates to bind components to vehicle GPS locations or global alerts.
