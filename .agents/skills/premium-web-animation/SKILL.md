---
name: premium-web-animation
description: >-
  Use this skill when designing, authoring, or refining animations, kinetic typography, scroll-driven interactions,
  and page transitions for fine art portfolios and catalogues raisonnés. Enforces "museum pacing" (dignified,
  unhurried spring physics and cubic easings), strict prefers-reduced-motion accessibility, zero GPU-straining blur
  cascades on gallery grids, and uncropped native artwork aspect ratio preservation. Leverages framer-motion and GSAP.
---

# Premium Web Animation (Museum Pacing & Kinetics)

This skill governs all kinetic motion, micro-interactions, scroll timelines, and progressive reveals across the atelier application.

---

## 1. The Core Philosophy of "Museum Pacing"

In a fine art sanctuary, motion must feel deliberate, gravitational, and serene. It should echo the unhurried experience of walking through an exhibition space:

1. **Stately Duration:**
   - Layout & section transitions: `0.8s` to `1.2s`.
   - Micro-interactions (hover, focus, toggles): `0.25s` to `0.4s`.
   - Never use abrupt, jittery, or hyperactive animations (< `0.15s` or excessive spring bounce).
2. **Spring Physics & Easing:**
   - Use high damping and moderate stiffness so elements glide into place without synthetic bouncing:
     - `stiffness: 140, damping: 28, mass: 1`
   - For cubic beziers, prefer `[0.22, 1, 0.36, 1]` (custom ease-out-quint) or `[0.16, 1, 0.3, 1]`.
3. **Artwork Image Integrity:**
   - **Never** scale, stretch, or rotate artwork images in 3D perspective during hover or transitions.
   - Artwork cards maintain their uncropped `object-fit: contain` rendering at all times.

---

## 2. GPU Performance & Hardware Acceleration Protocol

To preserve 60/120fps smoothness across laptops, tablets, and mobile devices:
- **Transform & Opacity Only:** Animate exclusively `transform` (`x`, `y`, `scale`) and `opacity`.
- **Restrict `filter: blur()`:**
  - Do **NOT** apply animated `filter: blur()` across large gallery grids with dozens of artwork images (this triggers massive GPU recomposition passes).
  - Use `opacity: 0 -> 1` and `y: 14px -> 0` for artwork cards in gallery grids.
  - Limit `filter: blur()` strictly to short editorial headline reveals (`SplitText`) or fixed modal backdrops.
- **Will-Change Management:** Use `will-change: transform, opacity` sparingly and clean up after animations settle.

---

## 3. Approved Animation Patterns (`framer-motion`)

All React motion components must import strictly from `'framer-motion'`:
```tsx
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
```

### Pattern A: Staggered Editorial Word Reveal (`SplitText`)
- **Use Case:** Hero title ("The Archival Sanctuary") and major section headlines.
- **Kinetics:** Words fade in sequentially with a subtle `y: 8px -> 0` lift.
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};

const wordVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};
```

### Pattern B: Staggered Gallery Card Entrance
- **Use Case:** Gallery grid items and collection cards.
- **Kinetics:** Hardware-accelerated lift and fade.
```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};
```

### Pattern C: Magnetic Curatorial Action Buttons
- **Use Case:** High-touch primary actions (`[ Inquire for Acquisition ]`, `[ Arrange Consultation ]`).
- **Kinetics:** Subtly tracks cursor proximity (within 20px) with damped spring resistance, returning smoothly to center on mouse leave.

---

## 4. Accessibility & Strict Reduced-Motion Hardening

Every animation must unconditionally obey the user's operating system preferences:

```tsx
import { useReducedMotion } from 'framer-motion';

export const CuratorialSection = () => {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.01 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } };

  return <motion.div {...animationProps}>...</motion.div>;
};
```

Global CSS Modules automatically enforce:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Phase 2/3 Extension Roadmap: 3D & Advanced Shaders

- **`react-three-fiber` / `drei`:** Reserved as a Phase 2/3 modular extension for interactive 3D framed canvas inspection with realistic shadow casting and lighting. (Do NOT install `@react-three/*` packages until explicitly requested for that phase).
- **GSAP ScrollTrigger:** Utilized for advanced pinning and monograph storytelling when editorial complexity exceeds standard CSS/Framer Motion capabilities.
