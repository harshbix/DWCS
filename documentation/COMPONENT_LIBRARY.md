# Component Library

✅ **Status**: Implemented

All reusable UI elements reside in `components/ui/`. They are strictly presentation-only and receive data via props.

## Core UI Components

### `Button` (`button.tsx`)
- **Purpose:** Primary interaction element.
- **Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
- **Sizes:** `default`, `sm`, `lg`, `icon`.
- **Dependencies:** `class-variance-authority` (cva), `@radix-ui/react-slot` (optional).

### `Card` (`card.tsx`)
- **Purpose:** Container for dashboard widgets.
- **Sub-components:** `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Performance:** High. Pure HTML/CSS.

### `Skeleton` (`skeleton.tsx`)
- **Purpose:** Loading state placeholder.
- **Animation:** Uses custom CSS `@keyframes shimmer` defined in `globals.css` for a high-end sweeping gradient effect.

### `ProximityHUD` (`tracking/proximity-hud.tsx`)
- **Purpose:** Complex tracking component.
- **Props:** `proximity: ProximityState`.
- **Features:** Animates distance rings, computes ETA logic purely from passed state, displays alerts.

## Accessibility (A11y)
- Buttons and interactive elements utilize standard Tailwind `:focus-visible` states to render a 2px offset primary ring.
- Semantic HTML tags (`<dialog>`, `<nav>`, `<main>`) are enforced.
