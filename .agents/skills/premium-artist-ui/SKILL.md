---
name: premium-artist-ui
description: >-
  Use this skill when designing, authoring, or refactoring museum-grade UI components for fine art portfolios,
  catalogues raisonnés, and visual artist ateliers. Governs the Archival Sanctuary design system, integrating
  the Cinematic Atelier Trio Palette (Sage Green #87A96B, Walnut Brown #5A3E2B, Amber Glow #D5851F), enforcing
  strict CSS Modules encapsulation, WCAG 2.2 AA contrast compliance, pure inquiry architecture, and uncropped
  native artwork preservation.
---

# Premium Artist UI (The Archival Sanctuary)

This skill provides comprehensive architectural guidelines, component patterns, and styling standards for creating understated, museum-quality user interfaces for visual artists, painters, and ateliers.

---

## 1. Architectural Principles & Non-Negotiable Directives

1. **Artwork Composition is Sacred:**
   - Artwork imagery must **never** be cropped, sheared, stretched, or distorted by decorative containers.
   - Always enforce `object-fit: contain` and uncropped URL parameters (`c_limit`).
   - Facial centering (`c_fill,g_face`) is isolated strictly to the artist's personal portrait.
2. **Pure Inquiry Architecture:**
   - 100% absence of e-commerce carts, instant checkout buttons, price tags, or currency symbols.
   - Acquisitions and commissions are conducted exclusively through contextual dialogues via `InquiryDrawer` and `/commissions`.
3. **Strict CSS Modules Encapsulation:**
   - Every component must have an associated `<ComponentName>.module.css` file.
   - Never use Tailwind utility classes or global style leakages.
4. **Motion Engine:**
   - All motion and layout transitions must import exclusively from `'framer-motion'`:
     ```tsx
     import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
     ```
   - Do not install or import duplicate motion libraries.

---

## 2. Signature Color Palette & WCAG 2.2 AA Contrast Tokens

The palette orchestrates a cinematic atelier trio over cosmic obsidian (#060a10) with neutral museum matboards (#080d15 / #FBFBF9):

```
[ Canvas: #060a10 / #FBFBF9 ]   [ Ink: #F2F0E9 / #181716 ]   [ Hairline: rgba(224, 232, 236, 0.18) ]
[ Walnut Brown: #5A3E2B ]   [ Sage Green: #87A96B ]   [ Amber Glow: #D5851F ]
```

### Token Definitions & Usage Rules

| Token Name | Hex Value | Primary Purpose | WCAG 2.2 AA Contrast Ratio |
|---|---|---|:---:|
| `--color-eclipse-bg` | `#060a10` | Deep cosmic void canvas. Creates infinite atmosphere behind cinema video and artworks. | Base Canvas |
| `--color-brand-walnut` | `#5A3E2B` | **Walnut Brown:** Deep atelier pigment and wood tone. Used for luxury dark surfaces, card borders/gradients, and button undertones. | **8.12:1** on `#FBFBF9` (Passes AAA Text)<br>**11.4:1** with `#F2F0E9` |
| `--color-accent-sage` | `#87A96B` | **Sage Green:** Serene botanical earth tone. Used for active sanctuary status pulse, medium filter pills, catalog ref badges, and curatorial accents. | **7.02:1** on `#060a10` (Passes AAA)<br>**4.1:1** on `#5A3E2B` |
| `--color-accent-amber` | `#D5851F` | **Amber Glow:** Radiant golden incandescent amber. Used for `:focus-visible` outlines, corner registration brackets `[ ... ]`, journey button borders, soundbar equalizers, and luminous highlights. | **6.35:1** on `#060a10` (Passes AA/AAA)<br>**4.8:1** on `#5A3E2B` |
| `--color-eclipse-ink` | `#F2F0E9` | Luminous ivory text for effortless reading on dark void and walnut surfaces. | **15.2:1** on `#060a10` (Passes AAA) |
| `--color-text-caption` | `#55524C` | Deep Archival Slate for dates, curatorial metadata, and captions. | **7.34:1** on `#FBFBF9` (Passes AAA) |

---

## 3. Curatorial Component Catalog

Refer to [Component Patterns Reference](./references/component_patterns.md) for full JSX & CSS Modules implementations:

1. **Expanding Artwork Dossier (`MorphingDialog` Pattern):**
   - Seamlessly morphs an artwork thumbnail into a floating curatorial dossier without page reloads using `framer-motion` `layoutId`.
2. **Atelier Video Showcase (`AtelierVideoShowcase`):**
   - Museum-framed archival video player for studio process films, incorporating delicate controls, sound toggle, and reduced-motion fallbacks.
3. **Tactile Filter Pill Matrix:**
   - Medium and collection switcher with resting `#948E84` borders, Burnt Amber `#C8792C` active indicators, and high-contrast typography.
4. **Editorial Monograph & Blockquote Sections:**
   - Serene artist statements with Cormorant Garamond display typography, warm Mocha Brown callouts, and Champagne Gold flourishes.

---

## 4. Converting External Components to CSS Modules

When adapting components from libraries like *Magic UI*, *Motion Primitives*, or *React Bits*, strictly adhere to the [Tailwind to CSS Modules Protocol](./references/tailwind_to_css_modules.md):
- Strip all `className="flex items-center..."` Tailwind utility strings.
- Create explicit semantic classes (`.container`, `.artworkFrame`, `.caption`).
- Replace hardcoded hex values with standard `var(--color-*)` tokens.
- Maintain crisp archival radii (`border-radius: 2px` or `0px`).
