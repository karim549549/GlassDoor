---
name: gsap-scrolltrigger
description: >-
  Architectural patterns for GSAP 3 and ScrollTrigger in Next.js App Router / React 19.
  Covers scroll-driven pinning, scrubbed timeline sequences, magnetic cards, 3D orbits,
  gradient text reveals, and strict teardown with gsap.context().
---

# GSAP & ScrollTrigger Animation Skill

## Principles & Rules

1. **Context-Scoped Cleanup**:
   - Always wrap GSAP animations in `gsap.context()` inside a `useEffect` or `useGSAP` hook so all tweens and `ScrollTrigger` instances are cleanly killed on unmount.
   ```typescript
   useEffect(() => {
     const ctx = gsap.context(() => {
       gsap.to(".target", {
         scrollTrigger: {
           trigger: containerRef.current,
           start: "top top",
           end: "+=1200",
           scrub: 0.8,
           pin: true,
         },
         y: -100,
         opacity: 0,
       });
     }, containerRef);
     return () => ctx.revert();
   }, []);
   ```

2. **Scrubbed Storytelling & Progressive Text Fills**:
   - For high-impact statements (inspired by modern benchmark sites like `fpslabs.ai`), use linear gradient background-clip text with scrubbed `--highlight-fill` CSS variables or staggered character/word tweens.

3. **3D Card Orbits & Perspective Carousels**:
   - Use CSS 3D transforms (`preserve-3d`, `perspective: 1200px`, `rotateY`, `translateZ`) driven by scroll progress for multi-tier product showcases (Contestants, Recruiters, Organizers).

4. **Hardware Acceleration**:
   - Target properties that only trigger composite (`transform`, `opacity`, `filter`). Avoid animating layout properties (`width`, `height`, `top`, `left`) directly in scrubbed loops. Add `will-change: transform` sparingly during active scrubbing.
