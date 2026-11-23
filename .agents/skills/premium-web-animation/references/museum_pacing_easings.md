# Museum Pacing & Easing Configurations
**Skill:** `premium-web-animation`  

This document catalogs mathematically verified easing curves and spring configurations that deliver serene, gravitational, and luxury physical motion for fine art interfaces.

---

## 1. Curated Cubic Bezier Easings

| Name | Cubic Bezier Array | CSS Equivalent | Ideal Use Case |
|---|---|---|---|
| **Archival Glide (Ease-Out-Quint)** | `[0.22, 1, 0.36, 1]` | `cubic-bezier(0.22, 1, 0.36, 1)` | Card entrances, drawer slides, expanding dossiers. Starts briskly, decelerates gracefully. |
| **Monograph Deceleration** | `[0.16, 1, 0.3, 1]` | `cubic-bezier(0.16, 1, 0.3, 1)` | Full-screen page transitions, hero title word reveals. |
| **Delicate Whispering Fade** | `[0.25, 0.1, 0.25, 1]` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Subtle opacity dissolves, image crossfades. |

---

## 2. Framer Motion Spring Presets

Use these physics parameters for natural, tactile responses without artificial bounce:

```typescript
// Serene Atelier Spring (Zero Overshoot)
export const sereneSpring = {
  type: "spring",
  stiffness: 140,
  damping: 28,
  mass: 1,
  restDelta: 0.001
};

// Gentle Tactile Spring (Subtle Damped Settling for Buttons)
export const buttonSpring = {
  type: "spring",
  stiffness: 300,
  damping: 24,
  mass: 0.8
};

// Drawer Slide Spring
export const drawerSpring = {
  type: "spring",
  stiffness: 180,
  damping: 32,
  mass: 1.1
};
```

---

## 3. Recommended Timing Hierarchy

- **Micro-Interactions (Button hover, tab switch):** `250ms – 350ms`
- **Component Entrances (Artwork cards, filter pills):** `600ms – 850ms`
- **Modal / Drawer Deployments:** `750ms – 950ms`
- **Monograph Headline Staggers:** `60ms – 80ms delay per word`
