# API Services Directory

This directory contains the central data fetching layers:

- `client.ts` - Configured Axios client mapping for browser environments.
- `request.ts` - Unified service request abstraction. Swaps between native server-side `fetch()` and client-side `apiClient` Axios operations.
- `response.ts` - TypeScript contracts for standard and paginated JSON responses.
- `interceptors.ts` - Axios interceptors for bearer authentication token injection and response wrapper mappings.
- `errors.ts` - Domain API Error translator.
