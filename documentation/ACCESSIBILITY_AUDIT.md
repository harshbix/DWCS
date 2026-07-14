# Accessibility Audit

✅ **Status**: Completed | 📅 **Date**: July 2026

## Overall Accessibility Score: 7.5/10

The project utilizes semantic HTML and Radix UI principles, but requires tuning for complete WCAG 2.1 AA compliance.

| Criterion | Status | Notes |
| :--- | :--- | :--- |
| **Keyboard Navigation** | ✅ Good | Most elements are focusable. `globals.css` provides clear `:focus-visible` rings. |
| **Contrast Ratios** | ✅ Excellent | Mbeya Green (`#0f5238`) on Off-white (`#fcf8fb`) easily exceeds 4.5:1 ratio. |
| **Screen Readers** | 🟡 Acceptable | Native HTML elements work well. Custom Mapbox UI needs better ARIA labels. |
| **Motion Reduction** | 🔴 Missing | Framer Motion animations do not currently respect `prefers-reduced-motion`. |

## Recommendations
1. **Reduce Motion:** Update Framer Motion variants to check for CSS media queries and disable layout shifting if requested by the user's OS.
2. **Form Labels:** Ensure all React Hook Form inputs have explicit `htmlFor` bindings to `<label>` tags.
3. **Map Fallbacks:** Map interfaces are inherently difficult for screen readers. Provide a "Text Only Route Schedule" view alongside the interactive map.
