# UI Design System

✅ **Status**: Implemented

The system adheres to a custom theme inspired by Material Design 3, deeply integrated into **Tailwind CSS v4** via `app/globals.css`.

## Core Color Palette
- **Primary (Mbeya Green):** `--color-primary: #0f5238`
- **Primary Container:** `--color-primary-container: #2d6a4f`
- **Secondary (Soft Green):** `--color-secondary: #4c6452`
- **Background / Surface:** `--color-background: #fcf8fb`
- **Error / Alerts:** `--color-error: #ba1a1a`
- **Warning:** `--color-warning: #b45309`

## Typography
Configured in `tailwind.config` / `globals.css`.
- **Sans (Primary):** *Plus Jakarta Sans* (Used for headings, cards, UI text).
- **Sans (Secondary):** *Inter* (Used for long-form reading, paragraphs).
- **Mono:** *JetBrains Mono* (Used for code, tracking IDs, coordinates).

## Spacing & Grid
Standard Tailwind 4px baseline grid.
- Extended spacing tokens added to CSS variables (e.g., `--space-4: 16px`).

## Border Radius
Heavily rounded, premium aesthetic.
- `--radius-2xl: 24px` (Used for main Dashboard Cards).
- `--radius-full: 9999px` (Used for pills and avatars).

## Animation Tokens
Standardized easings defined in `globals.css`:
- `--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- `--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)`

## Dark Mode
🔵 **Status:** Planned. Currently, the system is locked to a highly optimized Light Mode (`#fcf8fb` background). CSS variables are structured to support a future media-query override for dark theme.
