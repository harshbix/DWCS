# Technical Debt

🟡 **Status**: Tracked

Technical debt represents conscious decisions made to accelerate the MVP/Prototype phase that must be addressed for long-term scalability.

## 1. Express Backend Split (Medium Priority)
- **Why it exists:** The team was originally more comfortable writing Node/Express endpoints for webhooks rather than learning Deno-based Supabase Edge Functions.
- **Impact:** Forces the project to maintain two separate hosting environments (Vercel for Frontend, Railway/Render for Backend), doubling DevOps overhead.
- **Solution:** Port `/api/payments/callback` to a Supabase Edge Function.
- **Estimated Effort:** 2 days.

## 2. Zero Automated Testing (High Priority)
- **Why it exists:** Fast-paced UI prototyping prioritized visual milestones over Test-Driven Development.
- **Impact:** Any major refactor of the `proximity-hud` or RLS policies risks silent regressions in production.
- **Solution:** Introduce Playwright for E2E critical path testing and pgTAP for database assertions.
- **Estimated Effort:** 1 week.

## 3. Client-Side Image Compression (Low Priority)
- **Why it exists:** The native HTML file input was easiest to wire up directly to Supabase Storage.
- **Impact:** Users uploading 10MB raw iPhone photos for complaints will eat through bandwidth quotas and experience slow upload times on 3G networks.
- **Solution:** Implement `browser-image-compression` library before the `supabase.storage.upload()` call.
- **Estimated Effort:** 1 day.
