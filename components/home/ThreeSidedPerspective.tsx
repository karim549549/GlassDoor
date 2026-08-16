"use client";

import React, { useEffect, useRef } from "react";
import { ARENA_CARDS, type ArenaCardData } from "./Hero/arena-cards-data";

/**
 * Section 4 - the arena deck, closed into a cube.
 *
 * The faces are NOT the same DOM nodes as the cards in sections 1 and 2, and
 * deliberately so. An earlier attempt hoisted one shared deck out of every
 * section into a fixed layer, because CSS 3D only composes for descendants of
 * the preserve-3d parent - technically correct, and it broke both sections it
 * passed through.
 *
 * The simpler route is the one the page already gives us: the cards descend
 * behind section 3 and are out of sight for a full screen of scroll. Anything
 * that happens to them in that window is invisible, so the three landscape
 * cards can simply end there and six cube faces begin here. The reader sees
 * continuity; the DOM never has to.
 *
 * The section is a full lifecycle, all of it driven by its own scroll position:
 *
 *   arrive    panels fall in from ABOVE, in the direction the deck was already
 *             travelling when it went behind section 3, styled exactly like the
 *             hero card so the handoff is invisible
 *   seat      each panel rotates into its face and restyles from paper to dark
 *             panel as it goes - a light card is right for a stack and wrong
 *             for one side of a solid on a near-black ground
 *   dwell     the cube is closed and can be turned
 *   leave     the stagger runs in REVERSE and the panels carry on DOWNWARD,
 *             turning back into paper on the way, so the carousel below reads
 *             as the same cards arriving rather than a new set appearing
 *
 * Nothing here fades. Opacity is never touched: these are solid cards moving
 * through the page, and fading them would make them read as elements being
 * created and destroyed instead of one deck travelling.
 */

/** Cube edge in px. Faces are square, so this is both width and height. */
const SIZE = 420;
const HALF = SIZE / 2;

/**
 * Per face: the rotation that places it, its outward normal, and where it sits
 * before assembly. Rotation is stored as numbers rather than a transform string
 * because the cube is BUILT on scroll - every face interpolates from its
 * scattered start to its final angle, and a prebaked string cannot be halfway.
 */
const FACE_GEOMETRY = [
  { rx: 0, ry: 0, normal: [0, 0, 1] as [number, number, number], from: [0, -55], to: [0, 60], spin: -3 },
  { rx: 0, ry: 90, normal: [1, 0, 0] as [number, number, number], from: [42, -30], to: [-38, 34], spin: 4 },
  { rx: 0, ry: 180, normal: [0, 0, -1] as [number, number, number], from: [-36, 26], to: [30, -28], spin: -2 },
  { rx: 0, ry: -90, normal: [-1, 0, 0] as [number, number, number], from: [-46, -18], to: [-40, 22], spin: 3 },
  // CSS Y grows downward, so rotateX(90deg) sends +Z to -Y.
  { rx: 90, ry: 0, normal: [0, -1, 0] as [number, number, number], from: [24, -48], to: [34, 52], spin: -5 },
  { rx: -90, ry: 0, normal: [0, 1, 0] as [number, number, number], from: [-28, 44], to: [-30, -46], spin: 2 },
];

/** Assembly finishes by this fraction of the section's scroll, leaving the rest
 *  as dwell time in which the cube can be turned. */
const ASSEMBLE_BY = 0.72;
/**
 * How closed the cube already is when it comes into view.
 *
 * Watching six loose panels converge from across the viewport read as chaos -
 * there was no object yet, just debris. The cube now arrives ALREADY BUILT to
 * this fraction and only settles the last of the way, so what descends is
 * recognisably a solid from the first frame. Below about 0.7 it stops reading
 * as a box; at 1.0 there is nothing left to watch.
 */
const PARTIAL_SEAT = 0.78;
/** Distance above the stage the assembly starts, in px. */
const ARRIVE_FROM = 1250;
/** Fraction of the section over which it descends into place. */
const ARRIVE_BY = 0.5;
/** Per-face stagger, so the box closes panel by panel instead of all at once. */
const FACE_STAGGER = 0.09;
/**
 * Where disassembly begins, as a fraction of the section scroll. Past this the
 * cube opens back into loose cards travelling DOWNWARD - the same direction the
 * deck took out of section 2 - so the carousel below reads as the same cards
 * arriving rather than a new set appearing from nothing.
 */
const DISASSEMBLE_FROM = 0.82;

interface Callout {
  face: number;
  label: string;
  value: string;
  side: "left" | "right";
  top: string;
  inset: string;
  line: number;
}

/**
 * Exploded-view annotations. A square cube cannot fill a 16:9 viewport without
 * overflowing its height, so the width is carried by radiating callouts rather
 * than by widening the solid or parking a text column beside it.
 *
 * `top`, `inset` and `line` are deliberately irregular - a regular grid of these
 * would be the wireframe this layout exists to avoid.
 */
const CALLOUTS: Callout[] = [
  { face: 0, label: "Formats", value: "REP · LIVE · ARENA", side: "left", top: "34%", inset: "3%", line: 190 },
  { face: 3, label: "Rubric", value: "Frozen before entry", side: "left", top: "56%", inset: "1%", line: 245 },
  { face: 5, label: "Conflicts", value: "Blocked in the database", side: "left", top: "78%", inset: "5%", line: 164 },
  { face: 2, label: "Ledger", value: "Append-only", side: "right", top: "22%", inset: "4%", line: 178 },
  { face: 1, label: "Evidence", value: "Commits + defense", side: "right", top: "52%", inset: "1%", line: 238 },
  { face: 4, label: "Window", value: "Set by the host", side: "right", top: "80%", inset: "6%", line: 156 },
];

/**
 * Flywheel constants. Drag is the only input: scroll used to spin it too, but
 * two sources fighting for one rotation meant the cube moved while you were
 * only reading, and a face could never be parked.
 */
const DRAG_IMPULSE = 0.13;
const FRICTION = 0.94;
const IDLE_DRIFT = 0.018;

/**
 * The card restyles itself as it seats.
 *
 * A face arrives looking exactly like the hero card - light paper, four-pixel
 * double border, ink text - because that is what descended out of section 2 and
 * the handoff has to be invisible. But a light card is wrong once it is one
 * panel of a solid on a near-black section: the box loses its edges and reads
 * flat. So the two looks are interpolated across the same progress that seats
 * the panel, and the change happens while the reader is watching the cube form
 * rather than as a jump.
 *
 * Border style cannot be interpolated - double to solid has no midpoint - so it
 * switches once, at the point the panel is mostly seated.
 */
const PAPER = { bg: [250, 248, 245], fg: [14, 14, 13], border: [14, 14, 13], borderAlpha: 1, borderPx: 4 };
const PANEL = { bg: [35, 35, 32], fg: [241, 239, 233], border: [255, 255, 255], borderAlpha: 0.3, borderPx: 1 };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixRgb = (a: number[], b: number[], t: number) =>
  `rgb(${Math.round(mix(a[0], b[0], t))}, ${Math.round(mix(a[1], b[1], t))}, ${Math.round(mix(a[2], b[2], t))})`;
const mixRgba = (a: number[], b: number[], aA: number, bA: number, t: number) =>
  `rgba(${Math.round(mix(a[0], b[0], t))}, ${Math.round(mix(a[1], b[1], t))}, ${Math.round(mix(a[2], b[2], t))}, ${mix(aA, bA, t).toFixed(3)})`;

/** Applies rotateX(rx) rotateY(ry) to a vector, matching the CSS order. */
function rotateVec(v: [number, number, number], rx: number, ry: number): [number, number, number] {
  const rad = Math.PI / 180;
  const cy = Math.cos(ry * rad);
  const sy = Math.sin(ry * rad);
  const x1 = v[0] * cy + v[2] * sy;
  const y1 = v[1];
  const z1 = -v[0] * sy + v[2] * cy;
  const cx = Math.cos(rx * rad);
  const sx = Math.sin(rx * rad);
  return [x1, y1 * cx - z1 * sx, y1 * sx + z1 * cx];
}

export function ThreeSidedPerspective({ cards }: { cards?: ArenaCardData[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const calloutRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef<HTMLSpanElement>(null);

  // Six faces, whatever the board holds. Sections 1 and 2 take the first three
  // of the same list, so the cube opens on the card the reader just watched
  // descend.
  const faces = React.useMemo(() => {
    const base = cards && cards.length > 0 ? cards : ARENA_CARDS;
    return Array.from({ length: 6 }, (_, i) => base[i % base.length]);
  }, [cards]);

  useEffect(() => {
    const section = sectionRef.current;
    const cube = cubeRef.current;
    const stage = stageRef.current;
    const scaler = scalerRef.current;
    if (!section || !cube || !stage || !scaler) return;

    // Cube geometry is in fixed px because translateZ cannot take a percentage,
    // so the wrapper scales instead.
    const fit = () => {
      const byHeight = window.innerHeight * 0.7;
      const byWidth = section.clientWidth - 120;
      scaler.style.transform = `scale(${Math.min(1, byHeight / SIZE, byWidth / SIZE)})`;
    };
    fit();
    window.addEventListener("resize", fit);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cube.style.transform = "rotateX(-14deg) rotateY(22deg)";
      return () => window.removeEventListener("resize", fit);
    }

    let rx = -14;
    let ry = 22;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let visible = true;
    let dragging = false;
    let touched = false;
    let lastPointer = { x: 0, y: 0 };
    let lastFront = -1;

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(section);

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      touched = true;
      lastPointer = { x: e.clientX, y: e.clientY };
      stage.setPointerCapture(e.pointerId);
      stage.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      vy += (e.clientX - lastPointer.x) * DRAG_IMPULSE;
      vx -= (e.clientY - lastPointer.y) * DRAG_IMPULSE;
      lastPointer = { x: e.clientX, y: e.clientY };
    };
    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      stage.style.cursor = "grab";
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;

      // Assembly is read from the section's own rect every frame. The sticky
      // stage holds the cube still in the middle of the viewport while this
      // runs, so the reader watches it close rather than arriving to find it
      // already built.
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const scrolled = travel > 0 ? clamp01(-rect.top / travel) : 0;
      const assembly = clamp01(scrolled / ASSEMBLE_BY);
      // Past the dwell the box opens again and the panels carry on downward.
      const teardown = clamp01((scrolled - DISASSEMBLE_FROM) / (1 - DISASSEMBLE_FROM));

      vx *= FRICTION;
      vy *= FRICTION;
      rx += vx;
      ry += vy;

      // No detent: the cube rests wherever momentum runs out. Until it is
      // touched, a slow drift keeps it legibly three-dimensional - but only
      // once there is a solid to drift.
      if (!touched && !dragging && assembly > 0.9) ry += IDLE_DRIFT;

      // How much of a solid there is right now: built up, then taken apart.
      const solid = assembly * (1 - teardown);

      // The assembly travels as ONE object rather than six. It descends from
      // above already mostly closed, and leaves the same way - what the reader
      // watches is a cube arriving and settling, not debris finding each other.
      const arrive = easeOut(clamp01(scrolled / ARRIVE_BY));
      const cubeY = ARRIVE_FROM * (1 - arrive) + ARRIVE_FROM * teardown;

      // Turning only applies to an assembled cube; spinning a half-open box
      // reads as broken rather than as motion. It also unwinds on the way out.
      cube.style.transform =
        `translateY(${cubeY}px) rotateX(${rx * solid}deg) rotateY(${ry * solid}deg)`;
      stage.style.pointerEvents = solid > 0.95 ? "auto" : "none";

      let front = 0;
      let bestZ = -Infinity;

      for (let i = 0; i < 6; i++) {
        const el = faceRefs.current[i];
        if (!el) continue;
        const g = FACE_GEOMETRY[i];

        // Staggered so the box closes panel by panel. Disassembly runs the
        // stagger in reverse, so the last panel in is the first one out and the
        // box unpeels rather than collapsing.
        const span = 1 - FACE_STAGGER * 5;
        const local = easeOut(clamp01((assembly - i * FACE_STAGGER) / span));
        const out = easeOut(clamp01((teardown - (5 - i) * FACE_STAGGER) / span));

        // Two curves, because geometry and colour want different ranges.
        //
        // `closed` is 0 -> 1 -> 0 across the section and drives the restyle, so
        // a panel is paper on the way in and paper again on the way out.
        //
        // `seat` never drops below PARTIAL_SEAT: the cube is already most of
        // the way built when it enters and only opens back that far when it
        // leaves, so it is always recognisably a solid rather than debris.
        const closed = local * (1 - out);
        const seat = mix(PARTIAL_SEAT, 1, closed);

        // Faces arrive from ABOVE, not out of nothing. The cards left section 2
        // travelling downward and were hidden behind section 3, so they have to
        // continue in that direction to read as the same objects. Each starts
        // well above the viewport - the sticky stage clips them until they
        // enter - and carries a little tumble that resolves as it seats.
        const [fx, fy] = g.from;
        const [tx, ty] = g.to;
        const rest = 1 - local;

        // Two offsets, only one of which is ever non-zero: the entry offset
        // decays as the panel seats, and the exit offset grows as it leaves.
        const offX = fx * rest + tx * out;
        const offY = fy * rest + ty * out;
        const spin = g.spin * (rest + out);

        el.style.transform =
          `translate3d(${offX}px, ${offY}px, 0) ` +
          `rotateZ(${spin}deg) ` +
          `rotateX(${g.rx * seat}deg) rotateY(${g.ry * seat}deg) ` +
          `translateZ(${HALF * seat}px)`;
        // Deliberately no opacity ramp: these are solid cards falling into
        // place, and fading them in would make them read as new elements
        // appearing rather than the deck arriving.

        // Restyle across the same progress that seats the panel: paper card in,
        // cube panel out. Children inherit `color`, so setting it here recolours
        // the whole face in one write.
        // Driven by seat, not by build, so the panel turns back into paper as
        // it leaves - which is exactly the card the carousel below renders.
        el.style.backgroundColor = mixRgb(PAPER.bg, PANEL.bg, closed);
        el.style.color = mixRgb(PAPER.fg, PANEL.fg, closed);
        el.style.borderColor = mixRgba(PAPER.border, PANEL.border, PAPER.borderAlpha, PANEL.borderAlpha, closed);
        el.style.borderWidth = `${mix(PAPER.borderPx, PANEL.borderPx, closed)}px`;
        el.style.borderStyle = closed > 0.6 ? "solid" : "double";
        el.style.boxShadow = `${mix(4, 0, closed)}px ${mix(4, 18, closed)}px ${mix(0, 50, closed)}px rgba(14,14,13,${mix(0.9, 0.85, closed)})`;

        const z = rotateVec(g.normal, rx * seat, ry * seat)[2];
        if (z > bestZ) { bestZ = z; front = i; }

        // Faces stay opaque and are shaded, never faded: a faded card takes its
        // border with it, and the borders are what make a solid read as solid.
        const shade = el.firstElementChild as HTMLElement | null;
        if (shade) shade.style.opacity = String(Math.max(0, 1 - Math.max(0, z)) * 0.5 * seat);
      }

      if (front !== lastFront) {
        lastFront = front;
        if (indexRef.current) indexRef.current.textContent = String(front + 1).padStart(2, "0");
        for (let i = 0; i < CALLOUTS.length; i++) {
          const el = calloutRefs.current[i];
          if (el) el.dataset.state = CALLOUTS[i].face === front ? "front" : "visible";
        }
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", fit);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", endDrag);
      stage.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full h-[320vh] bg-[#0E0E0D] text-[#F1EFE9] border-t border-white/10 select-none"
    >
      {/* Sticky stage: the cube is held in the middle of the viewport while it
          assembles, then stays put for the rest of the section so it can be
          turned. Sticky rather than a GSAP pin - pinning is what desynchronised
          the sections earlier in this file. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Background blueprint grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="timeline-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#timeline-grid)" />
        </svg>
      </div>

      {/* Corner brackets */}
      <div aria-hidden className="pointer-events-none absolute inset-6 md:inset-9 z-20 hidden sm:block">
        <div className="absolute left-0 top-0 h-8 w-px bg-white/20" />
        <div className="absolute left-0 top-0 h-px w-8 bg-white/20" />
        <div className="absolute right-0 top-0 h-8 w-px bg-white/20" />
        <div className="absolute right-0 top-0 h-px w-8 bg-white/20" />
        <div className="absolute bottom-0 left-0 h-8 w-px bg-white/20" />
        <div className="absolute bottom-0 left-0 h-px w-8 bg-white/20" />
        <div className="absolute bottom-0 right-0 h-8 w-px bg-white/20" />
        <div className="absolute bottom-0 right-0 h-px w-8 bg-white/20" />
      </div>

      {/* Exploded-view callouts. Hidden below lg, where there is no width to
          radiate into and they would stack into a column. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
        {CALLOUTS.map((c, i) => (
          <div
            key={c.label}
            ref={(el) => { calloutRefs.current[i] = el; }}
            data-state="visible"
            className="group absolute flex items-center transition-opacity duration-300 data-[state=visible]:opacity-60 data-[state=front]:opacity-100"
            style={{
              top: c.top,
              [c.side]: c.inset,
              flexDirection: c.side === "left" ? "row" : "row-reverse",
            } as React.CSSProperties}
          >
            <div className={c.side === "left" ? "text-right" : "text-left"}>
              <div className="font-mono text-[0.46rem] font-bold uppercase tracking-[0.24em] text-[#F1EFE9]/45 transition-colors group-data-[state=front]:text-orange">
                {c.label}
              </div>
              <div className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[#F1EFE9] mt-1 whitespace-nowrap">
                {c.value}
              </div>
            </div>
            <div
              className="h-px bg-[#F1EFE9]/25 mx-2 transition-colors group-data-[state=front]:bg-orange/70"
              style={{ width: c.line }}
            />
            <span className="h-1 w-1 shrink-0 bg-[#F1EFE9]/40 transition-colors group-data-[state=front]:bg-orange" />
          </div>
        ))}
      </div>

      {/* Corner HUD */}
      <div className="pointer-events-none absolute inset-8 md:inset-12 z-20 hidden sm:flex flex-col justify-between">
        <div className="flex items-start justify-between gap-8">
          {/* Masthead, in the same lockup Section 2 uses. */}
          <div className="max-w-md space-y-2">
            <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
              [03 / The board, assembled]
            </span>
            <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-none uppercase font-normal">
              Six Arenas, One Solid
            </h2>
            <p className="font-mono text-[0.58rem] text-[#F1EFE9]/50 uppercase tracking-widest leading-relaxed">
              The same cards that fanned out above. Every face is a live arena.
              Drag to turn it, click a face to enter.
            </p>
          </div>

          <span className="shrink-0 font-mono text-[0.55rem] uppercase tracking-[0.24em] text-[#F1EFE9]/45 tabular-nums">
            Face <span ref={indexRef} className="text-[#F1EFE9]">01</span> / 06
          </span>
        </div>

        <div className="flex items-end justify-between gap-6">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-[#F1EFE9]/45">
            Drag to turn
          </span>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-[#F1EFE9]/45">
            Live from the board
          </span>
        </div>
      </div>

      <div ref={scalerRef} className="relative z-10 origin-center will-change-transform">
        <div
          ref={stageRef}
          className="relative touch-pan-y"
          style={{ width: SIZE, height: SIZE, perspective: "1600px", cursor: "grab" }}
        >
          <div
            ref={cubeRef}
            className="absolute inset-0 will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            {faces.map((card, i) => (
              <div
                key={`${card.id}-${i}`}
                ref={(el) => { faceRefs.current[i] = el; }}
                // Hero card styling, unchanged: light card, double border, the
                // same inset rules. The handoff behind section 3 only reads as
                // continuous if the faces look like the cards that went in.
                className="absolute inset-0 border-double p-5 flex flex-col justify-between"
                style={{
                  backfaceVisibility: "hidden",
                  boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.9)",
                }}
              >
                {/* Shading overlay, driven per frame from how square-on the face
                    is, so the cube looks lit rather than partly transparent. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[#050505]"
                  style={{ opacity: 0 }}
                />

                {/* Outline grids */}
                <div className="absolute inset-1 border border-current/15 pointer-events-none" />
                <div className="absolute inset-1.5 border border-dashed border-current/10 pointer-events-none" />

                <div className="relative space-y-3 text-left">
                  <div className="font-display italic text-[1.15rem] leading-[1.1] tracking-tight">
                    <span className="text-orange font-bold not-italic font-mono text-[0.55rem] tracking-[0.2em] border border-orange px-1.5 py-0.5 inline-block mr-2 align-middle -translate-y-0.5">
                      [{card.tag}]
                    </span>
                    {card.title}
                  </div>
                  <p className="font-mono text-[0.48rem] opacity-60 uppercase tracking-widest leading-relaxed line-clamp-4">
                    {card.description}
                  </p>
                </div>

                <div className="relative flex flex-row items-end justify-between gap-3 pt-3 border-t border-dashed border-current/20 mt-3 text-left">
                  <div className="flex flex-col">
                    <span className="font-mono text-[0.4rem] uppercase tracking-[0.25em] opacity-55 mb-1 block font-bold">
                      [{card.timeLabel}]
                    </span>
                    <div
                      className={`font-mono text-[1rem] font-bold leading-none tracking-widest ${
                        card.isLive ? "opacity-100" : "opacity-60"
                      }`}
                    >
                      {card.timeValue}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[55%]">
                    {card.tech.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[0.45rem] uppercase tracking-wider font-bold opacity-85"
                      >
                        [{tech}]
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Small screens get no corner HUD - there is no room - so the hint
          appears under the cube instead. */}
      <p className="relative z-10 sm:hidden font-mono text-[0.5rem] uppercase tracking-[0.22em] text-[#F1EFE9]/40 mt-8">
        Drag to turn
      </p>
      </div>
    </section>
  );
}

export default ThreeSidedPerspective;
