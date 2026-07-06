# Utilities Directory

This directory contains system helpers and standard utility functions:

- `cn.ts` - Standard class merger helper linking `clsx` and `tailwind-merge`.
- `format.ts` - Formatters for Tanzanian Shilling (TZS) currency and ISO dates.
- `storage.ts` - Safe LocalStorage wrapper to prevent SSR compilation failures.
- `permission.ts` - Camera and Geolocation sensor check wrappers.
- `toast.ts` - App-wide notification toast triggers syncing directly with `useNotificationStore`.
