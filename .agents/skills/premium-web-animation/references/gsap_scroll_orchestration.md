# GSAP Scroll Orchestration for Fine Art Monographics
**Skill:** `premium-web-animation`  

When building multi-chapter artist monographs, interactive timelines, or pinned curatorial narratives, GreenSock Animation Platform (GSAP) paired with `ScrollTrigger` delivers 60fps performance without re-render thrashing.

---

## 1. Setup in React 19 + Vite

GSAP is free for commercial use under the standard Webflow GreenSock license.

```typescript
// Example usage with @gsap/react
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export const ArtistMonograph = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Media query guard for reduced motion
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Pinned chapter showcase
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1200",
          scrub: 1,
          pin: true
        }
      })
      .from(".chapter-quote", { opacity: 0, y: 30, duration: 1 })
      .from(".chapter-detail", { opacity: 0, scale: 0.98, duration: 1 }, "-=0.5");
    });
  }, { scope: containerRef });

  return <div ref={containerRef}>...</div>;
};
```

---

## 2. Guardrails for Fine Art Applications

1. **Always Scope Selectors:** Use `{ scope: containerRef }` in `useGSAP` to prevent leaking selectors outside the component.
2. **Never Crop Artwork During Scroll:** Only animate container position, opacity, or secondary background washes—never apply `scale > 1.0` that clips physical canvas boundaries.
3. **Always Clean Up:** `useGSAP` cleans up animations and kills ScrollTrigger instances automatically upon component unmount.
