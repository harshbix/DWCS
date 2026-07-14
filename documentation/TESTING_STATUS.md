# Testing Status

🟡 **Status**: Partially Implemented

Currently, testing relies heavily on TypeScript compilation and manual QA. Automated testing suites are required before production.

## Current State
- **Type Checking:** Strict TypeScript is enforced across both frontend and backend (`tsc --noEmit` validates all typings).
- **Schema Validation:** Zod prevents bad data mutation at the boundaries (Forms and API).

## Missing Test Layers

### 1. Unit Tests (🔴 Missing)
- **Tooling Recommended:** Vitest / Jest + React Testing Library.
- **Targets:** 
  - `useProximityTracking` (Mock GPS coordinates and verify Haversine math).
  - Zustand Stores (Verify state transitions).
  - Formatting utilities (`utils/format.ts`).

### 2. Integration Tests (🔴 Missing)
- **Tooling Recommended:** Supabase Local Testing (pgTAP).
- **Targets:**
  - Verify Row Level Security (RLS) actually blocks unauthorized requests.
  - Verify RPC functions (`v1_get_citizen_dashboard`) aggregate correctly.

### 3. End-to-End (E2E) Tests (🔴 Missing)
- **Tooling Recommended:** Playwright or Cypress.
- **Targets:**
  - Citizen login -> Check schedule -> Pay bill -> Track truck flow.

## Recommended Testing Strategy
For Release Candidate 1, prioritize setting up **Playwright** for the critical path (Citizen Login -> View Schedule) and **pgTAP** to ensure RLS policies are secure.
