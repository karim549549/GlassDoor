"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import * as THREE from "three";

/**
 * The nine-tailed fox that ignites across section 3.
 *
 * The artwork arrives already rendered - hot cores, sparks, glow and all - so
 * this shader deliberately does NOT try to synthesise the fire. An earlier
 * version built the whole neon look out of a flat white-on-black line mask
 * (four mip levels accumulated coolest-to-hottest); that is the right technique
 * for flat line art and the wrong one here, where re-lighting a finished plate
 * would only fight the art. What is left for the shader is the part a static
 * image cannot do:
 *
 *   - ignition, spreading from the head outward so the tails unfurl last;
 *   - a bright front that runs just ahead of the ignition edge;
 *   - a slow breathing term so the fire is never perfectly still;
 *   - a light sparkle pass on top of the sparks already in the plate;
 *   - two mip-biased samples as a cheap bloom, since additive blending over a
 *     black ground makes overlapping glow accumulate the way real light does.
 *
 * Scroll progress is measured from the section's own rect every frame rather
 * than read from a ScrollTrigger. We are already inside a render loop, so it is
 * free, and it cannot fall out of sync with the pinned card stack above this
 * section the way a cached start/end pair can.
 */

/** 274KB webp vs 1.7MB png, and smoother gradients in the glow falloff. */
const ART = "/artwork/devsarena-fox-fire.webp";
const ART_ASPECT = 1448 / 1086;

/**
 * Sizing knobs.
 *
 * COVER_Y below 1 guarantees the art fits the viewport height with no overflow.
 * WIDEN spreads it horizontally past its natural aspect - kept near 1 now that
 * the source is landscape, where the old portrait plate needed 1.9 and looked
 * stretched for it.
 */
const COVER_Y = 0.96;
const WIDEN = 1.15;

/**
 * How the fox composites onto whatever the section's CSS background is.
 *
 * "additive"  - overlapping glow accumulates, which is what makes fire read as
 *               emitting light. Correct over a dark background; over a light
 *               one it blows out to white.
 * "normal"    - straight alpha compositing. Use this if the section background
 *               ever becomes light. The fire looks flatter but stays readable.
 *
 * Changing this line is the whole switch - the shader and the asset already
 * handle both.
 */
const BLEND: "additive" | "normal" = "additive";

/**
 * The legibility pocket behind the statement, in screen-space UV.
 *
 * CENTER matches where the text block sits (centred in the sticky stage).
 * RADIUS is the ellipse the defocus covers - generous, because a tight pocket
 * shows its own edge and a wide one disappears.
 * DIM is how far brightness drops directly behind the text. Keep it mild: the
 * defocus is doing most of the work, and a hard dim reintroduces the visible
 * plate this design is trying to avoid.
 */
const TEXT_CENTER: [number, number] = [0.5, 0.5];
const TEXT_RADIUS: [number, number] = [0.3, 0.17];
const TEXT_DIM = 0.5;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uArt;
  uniform vec2  uScale;
  uniform float uProgress;
  uniform float uTime;
  uniform float uAdditive;
  uniform vec2  uTextCenter;
  uniform vec2  uTextRadius;
  uniform float uTextDim;
  uniform vec2  uPointer;
  uniform float uPointerAmt;
  uniform float uAspect;
  uniform vec3  uHot;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    // Map screen space onto the artwork, preserving its aspect.
    vec2 art = (vUv - 0.5) * uScale + 0.5;
    if (art.x < 0.0 || art.x > 1.0 || art.y < 0.0 || art.y > 1.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    // Legibility pocket.
    //
    // The statement sits directly on top of the brightest part of the fire, and
    // bright high-contrast lines behind serif italics are unreadable. Rather
    // than dimming the whole fox - which costs the effect everywhere to fix one
    // region - the artwork is pushed OUT OF FOCUS behind the text and darkened
    // only slightly. Defocused light stays bright and colourful but stops
    // competing for the eye, and because the falloff is wide and elliptical
    // there is no visible panel edge: it reads as depth of field, not a scrim.
    //
    // Measured in screen space, not artwork space, because the text is
    // positioned against the viewport.
    // The falloff window matters as much as the radius: ending it at 1.5 means
    // full brightness returns near the frame edges. An earlier 0.72-1.35 window
    // on a wider ellipse only recovered past the edge of the screen, which
    // dimmed the fox everywhere and defeated the point.
    vec2  td = (vUv - uTextCenter) / uTextRadius;
    float clear = smoothstep(0.9, 1.5, length(td));   // 0 behind text, 1 outside

    vec4 sharp = texture2D(uArt, art);
    vec4 soft  = texture2D(uArt, art, 3.4);
    vec4 tex   = mix(soft, sharp, clear);

    // Lossy WebP leaves invented colour in fully transparent pixels - measured
    // up to rgb(117,46,6) here - because alpha 0 makes RGB a don't-care to the
    // encoder. Additive blending adds RGB regardless of alpha, so that garbage
    // became an orange haze over the entire section. Zeroing RGB at encode time
    // does not survive the re-encode, so the gate has to live here. The
    // threshold is low enough to keep the faintest real glow.
    vec3 plate = tex.rgb * smoothstep(0.0, 0.03, tex.a);
    float lum = dot(plate, vec3(0.299, 0.587, 0.114));

    // Cheap two-radius bloom, gated the same way for the same reason.
    vec4 b1 = texture2D(uArt, art, 2.6);
    vec4 b2 = texture2D(uArt, art, 5.2);
    vec3 bloom = b1.rgb * smoothstep(0.0, 0.03, b1.a) * 0.30
               + b2.rgb * smoothstep(0.0, 0.03, b2.a) * 0.42;

    // Ignition spreads outward from the head, so the body lights first and the
    // tails unfurl last. Noise breaks up the ring so it never reads as a wipe.
    vec2  origin = vec2(0.30, 0.80);
    float order  = clamp(distance(art, origin) / 1.15, 0.0, 1.0);
    order += (fbm(art * 4.0) - 0.5) * 0.20;

    float reveal = smoothstep(order - 0.06, order + 0.06, uProgress);
    float front  = smoothstep(0.09, 0.0, abs(uProgress - order));

    // Cursor heat.
    //
    // A modifier, never a gate: it only intensifies fire that is already there,
    // so it cannot light the empty field. That matters twice over - the section
    // background has to stay visible through this layer, and a pointer halo
    // that glowed on its own would put back the background wash we just spent
    // effort removing.
    //
    // Aspect-corrected so the halo is round rather than stretched with the
    // viewport, and it reads 0 on touch devices where no pointer is reported.
    vec2  pd = (vUv - uPointer) * vec2(uAspect, 1.0);
    float heat = uPointerAmt * exp(-dot(pd, pd) * 14.0);

    // Gentle, because the plate already carries its own variation. This only
    // keeps it from sitting perfectly still.
    float burn = 0.82 + 0.30 * fbm(art * 5.0 + vec2(uTime * 0.03, -uTime * 0.022));
    burn += heat * 0.55;

    vec3 col = plate * burn + bloom;

    // A light sparkle pass on top of the sparks already in the artwork.
    //
    // Rewritten from a version that translated the whole grid by
    // floor(uTime * 6) each frame: that moved every spark in lockstep, which
    // read as the field sliding rather than embers glinting, and it snapped
    // between integer positions instead of transitioning. Sparks now stay put
    // and twinkle, each on its own phase and speed.
    //
    // Grid coordinates are in artwork space, so the sparks are anchored to the
    // fox and travel with it rather than floating over the screen.
    vec2  gv  = art * vec2(300.0, 225.0);
    vec2  id  = floor(gv);
    vec2  f   = fract(gv) - 0.5;
    float rnd = hash21(id);

    // Only a minority of cells ever hold a spark - more of them near the
    // cursor, so the fire visibly answers the hand.
    float has = step(0.93 - heat * 0.11, rnd);

    // Per-cell phase offset and speed. Without both, every spark peaks on the
    // same frame and the whole field pulses as one.
    float ph = fract(rnd * 41.7 + uTime * (0.18 + rnd * 0.42));
    float tw = smoothstep(0.0, 0.35, ph) * smoothstep(1.0, 0.55, ph);

    // Round core plus a cross flare - a star, not the square that a cell-wide
    // step() produces. The flare is deliberately thin on its short axis.
    float d     = length(f);
    float core  = smoothstep(0.32, 0.0, d);
    float flare = smoothstep(0.34, 0.0, abs(f.x)) * smoothstep(0.07, 0.0, abs(f.y))
                + smoothstep(0.34, 0.0, abs(f.y)) * smoothstep(0.07, 0.0, abs(f.x));

    // Faded in against local brightness rather than hard-gated, so sparks do
    // not pop into existence at the edge of a stroke.
    float spark = has * tw * (core + flare * 0.55) * smoothstep(0.05, 0.20, lum);
    col += uHot * spark * (1.8 + heat * 1.5);

    // The ignition edge burns brighter than the settled fire behind it.
    col += uHot * front * lum * 1.8;

    // Applied last so it also tames the bloom, the sparkles and the ignition
    // front - those are the brightest things on screen and the worst offenders
    // for legibility.
    col *= mix(uTextDim, 1.0, clear);

    // Output alpha is canvas COVERAGE, never the blend weight.
    //
    // This distinction caused a bug worth recording. Additive blending wants
    // RGB added at full strength, so an earlier version wrote alpha = 1 to stop
    // the glow being attenuated twice. But the canvas alpha channel is also
    // what composites this layer over the page - writing 1 everywhere made the
    // whole quad opaque, so every pixel without fire in it painted solid black
    // over the section background. The blend strength and the canvas coverage
    // are different quantities and cannot share one value.
    //
    // Resolved in the material instead: RGB is added with OneFactor (full
    // strength, independent of alpha), while alpha accumulates as real
    // coverage. So this can now report honestly how much light is here.
    // Additive: coverage is how much light this pixel emits, so bloom and
    // sparkles carry their own alpha and the empty field stays transparent.
    // Normal: the plate's own alpha is already the right answer.
    float emitted = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
    float coverage = mix(tex.a, emitted, uAdditive);

    gl_FragColor = vec4(col * reveal, coverage * reveal);
  }
`;

export function FoxBackground({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const section = sectionRef.current;
    if (!host || !section) return;

    // One-way switch, toggled on the DOM directly. Routing it through React
    // state would mean calling setState synchronously inside this effect on the
    // reduced-motion and no-WebGL paths, costing a render for a value that can
    // never change back.
    const showFallback = () => {
      if (fallbackRef.current) fallbackRef.current.style.display = "block";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showFallback();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      showFallback();
      return;
    }

    const isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearAlpha(0);
    // Raw passthrough. The plate is already authored in sRGB and the shader
    // hands its values straight out, so any conversion here would shift the
    // artwork's colour away from what was approved.
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const uniforms = {
      uArt: { value: null as THREE.Texture | null },
      uScale: { value: new THREE.Vector2(1, 1) },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uAdditive: { value: BLEND === "additive" ? 1 : 0 },
      uTextCenter: { value: new THREE.Vector2(...TEXT_CENTER) },
      uTextRadius: { value: new THREE.Vector2(...TEXT_RADIUS) },
      uTextDim: { value: TEXT_DIM },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerAmt: { value: 0 },
      uAspect: { value: 1 },
      uHot: { value: new THREE.Color("#fff2d2") },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      // Not THREE.AdditiveBlending, which is (SrcAlpha, One): that ties RGB
      // strength to the alpha channel, and alpha here has to stay free to
      // report canvas coverage so the section background shows through where
      // there is no fire. Custom blending separates the two - RGB adds at full
      // strength via OneFactor, alpha composites normally.
      blending: BLEND === "additive" ? THREE.CustomBlending : THREE.NormalBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      // The artwork was authored on black, so its RGB is already premultiplied
      // by its own coverage - true for both paths here.
      premultipliedAlpha: true,
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    let ready = false;
    new THREE.TextureLoader().load(
      ART,
      (tex) => {
        tex.colorSpace = THREE.NoColorSpace;
        // Mipmaps are load-bearing: the biased samples in the shader are bloom.
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        uniforms.uArt.value = tex;
        ready = true;
      },
      undefined,
      showFallback
    );

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      // Screen-uv span of the artwork per axis. Displayed height is COVER_Y * h;
      // displayed width is that height * aspect * WIDEN.
      uniforms.uScale.value.set(w / h / (COVER_Y * ART_ASPECT * WIDEN), 1 / COVER_Y);
      uniforms.uAspect.value = w / h;
    };
    resize();
    window.addEventListener("resize", resize);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(section);

    // Cursor heat. Bound only for fine pointers, so touch devices never pay for
    // listeners they cannot trigger and `amt` stays at 0 for them.
    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, amt: 0, tAmt: 0 };
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const onPointerMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      ptr.tx = x;
      ptr.ty = y;
      // Fade out rather than cut when the pointer leaves the stage, so the
      // heat recedes instead of vanishing mid-glow.
      ptr.tAmt = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? 1 : 0;
    };
    const onPointerLeave = () => { ptr.tAmt = 0; };

    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
    }

    const clock = new THREE.Clock();
    let raf = 0;
    let smoothed = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || !ready) return;

      // Same geometry the sticky stage uses: how far the section has travelled
      // through its own scroll distance.
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const target = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;

      smoothed += (target - smoothed) * 0.09;
      uniforms.uProgress.value = smoothed;
      uniforms.uTime.value = clock.getElapsedTime();

      // Lerped so the heat trails the cursor with a little weight, rather than
      // snapping to it - fire should feel like it takes a moment to catch.
      ptr.x += (ptr.tx - ptr.x) * 0.12;
      ptr.y += (ptr.ty - ptr.y) * 0.12;
      ptr.amt += (ptr.tAmt - ptr.amt) * 0.07;
      uniforms.uPointer.value.set(ptr.x, 1 - ptr.y);
      uniforms.uPointerAmt.value = ptr.amt;

      if (lightRef.current) {
        lightRef.current.style.opacity = String(Math.min(1, smoothed * 1.3) * 0.5);
        lightRef.current.style.transform = `scale(${0.85 + smoothed * 0.2})`;
      }

      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      uniforms.uArt.value?.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [sectionRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Ambient warmth only, and deliberately weak.
          A strong radial disc behind the fox washed the whole section orange,
          which is not how the artwork reads: the field stays near-black and the
          light is shaped by the strokes themselves. That shaping is the bloom
          in the shader, so it belongs there rather than in a circle behind it.
          This is left as a faint floor so the grid is not perfectly cold. */}
      <div
        ref={lightRef}
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-[opacity,transform]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,90,0,0.10) 0%, rgba(255,60,0,0.04) 40%, transparent 68%)",
        }}
      />

      <div ref={hostRef} aria-hidden className="absolute inset-0" />

      {/* No WebGL, or reduced motion: the same plate, statically. */}
      <div
        ref={fallbackRef}
        style={{ display: "none" }}
        className="fox-neon-art absolute left-1/2 top-1/2 h-[min(760px,90vh)] w-[min(1200px,96vw)] -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          src="/artwork/devsarena-fox-fire.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 96vw, 1200px"
          className="object-contain"
        />
      </div>
    </div>
  );
}

export default FoxBackground;
