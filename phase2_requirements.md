# EcoCollect Tanzania — Phase 2 Implementation Specification

## Supabase Integration, Authentication, Authorization, Data Services, Dashboard Logic & Optimization

You are continuing development of the EcoCollect Tanzania project.

Phase 1 has already been completed:

✓ Next.js 15 migration  
✓ TypeScript configuration  
✓ UI component architecture  
✓ Dashboard layouts  
✓ Express backend foundation  
✓ Supabase database architecture  
✓ SQL migrations  
✓ Row Level Security policies  
✓ RPC functions  
✓ Materialized dashboard views  
✓ Storage buckets  
✓ Realtime configuration  

The goal of Phase 2 is to connect the existing application to Supabase and transform the prototype into a real production system.

---

# Important Rules

Before writing any code:

1. Inspect the existing project structure.
2. Understand current architecture.
3. Reuse existing components.
4. Do not create duplicate files.
5. Do not redesign the database.
6. Do not modify database tables unless absolutely necessary.

The Supabase database is already the source of truth.

---

# Critical Performance Requirement

The application must make the minimum possible database requests.

Avoid:

- Multiple queries for one dashboard screen.
- Fetching the same data repeatedly.
- Database calls inside reusable components.
- Loading unnecessary columns.
- Large unpaginated queries.
- Excessive realtime subscriptions.

Always:

- Use RPC functions for dashboards.
- Use server components where possible.
- Use React Query caching.
- Select only required columns.
- Use pagination for lists.
- Update cache instead of refetching everything.

---

# Existing Supabase Architecture

First inspect:
