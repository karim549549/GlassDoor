---
name: core-3d-animation
description: >-
  Expert guidelines for 3D WebGL graphics and Three.js canvas rendering in Next.js / React 19.
  Covers high-performance particle fields, holographic coordinate HUDs, geometry pooling,
  shader materials, on-demand frameloops, and context loss prevention.
---

# Core 3D & WebGL Animation Skill

## Principles & Engineering Standards

1. **Performance First & Zero Jank**:
   - Always run WebGL canvas rendering inside an isolated `requestAnimationFrame` loop or hook.
   - Use `powerPreference: "high-performance"` and `antialias: true` with a clamped pixel ratio (`Math.min(window.devicePixelRatio, 2)`).
   - Never instantiate geometries or materials inside the render loop (`tick()` / `animate()`).

2. **Clean Disposal & WebGL Context Safety**:
   - In Next.js client components, always clean up event listeners, cancel `requestAnimationFrame`, call `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`, and remove the `<canvas>` DOM element in the `useEffect` cleanup return.

3. **Particle Field & Holographic Wireframe Rigs**:
   - Use `THREE.BufferGeometry` with `Float32Array` attributes (`position`, `color`, `size`) for maximum throughput.
   - Implement interactive mouse/cursor parallax by smoothly interpolating target coordinates (`mouse.x * 0.05`, lerp factor `0.05`).

4. **Reduced Motion & Device Graceful Degradation**:
   - Respect `window.matchMedia("(prefers-reduced-motion: reduce)")`. When active, freeze orbital rotation or fall back to high-fidelity static CSS gradients.
