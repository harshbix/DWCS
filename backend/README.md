# EcoCollect Core API Backend

This directory houses the Express + TypeScript backend service for the EcoCollect waste management platform.

## Directory Layout

- `src/`
  - `config/` - Environment configuration loaders and centralized Winston logger services.
  - `controllers/` - API handler adapters mapped to routes (reserved for business features).
  - `middleware/` - CORS, security filters, request validators, and global error handlers.
  - `routes/` - Versioned HTTP routing tables (`/api/v1/system/health`).
  - `services/` - Supabase connections and external payment adapters.
  - `repositories/` - Data accessor adapters (reserved for database operations).
  - `validators/` - Zod request body validator schemas (reserved).
  - `types/` & `interfaces/` - Backend data contracts.

## Getting Started

1. Set up a `.env` file in this directory based on the root template.
2. Run `npm install` inside this folder.
3. Start development server: `npm run dev`.
4. Compile production build: `npm run build`.
