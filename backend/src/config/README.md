# Backend Config Folder

This folder handles server configuration variables and logging transports:

- `env.ts` - Parses process environment settings via Zod and locks startup if requirements are omitted.
- `logger.ts` - Exports winston logger streams for info, errors, HTTP routing, and database performance traces.
