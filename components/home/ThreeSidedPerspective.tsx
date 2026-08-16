"use client";

import React, { useEffect, useRef } from "react";

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
 * The cube is always whole. It descends from above already built, holds while
 * the reader turns it, and scrolls away - nothing assembles and nothing comes
 * apart.
 *
 * Both animations existed and both were removed. Watching six panels fold
 * together left the object indistinct for most of its screen time, and running
 * that in reverse on exit competed with the carousel forming below it. Neither
 * gave the section any sharpness, which is the whole reason a solid is here.
 * The only thing scroll drives now is where the cube is.
 */

/** Cube edge in px. Faces are square, so this is both width and height. */
const SIZE = 420;
const HALF = SIZE / 2;

/** Per face: the rotation that places it, and the outward normal that produces. */
const FACE_GEOMETRY = [
  { rx: 0, ry: 0, normal: [0, 0, 1] as [number, number, number] },
  { rx: 0, ry: 90, normal: [1, 0, 0] as [number, number, number] },
  { rx: 0, ry: 180, normal: [0, 0, -1] as [number, number, number] },
  { rx: 0, ry: -90, normal: [-1, 0, 0] as [number, number, number] },
  // CSS Y grows downward, so rotateX(90deg) sends +Z to -Y.
  { rx: 90, ry: 0, normal: [0, -1, 0] as [number, number, number] },
  { rx: -90, ry: 0, normal: [0, 1, 0] as [number, number, number] },
];

/** Distance above the stage the assembly starts, in px. */
const ARRIVE_FROM = 1250;
/** Fraction of the section over which it descends into place. */
const ARRIVE_BY = 0.5;

/**
 * What a developer walks away with.
 *
 * The page already spends three sections showing arena cards; a fourth was the
 * same pitch a third time. These six faces answer the question those sections
 * leave open - why enter one at all - in the reader's terms rather than ours.
 * Nothing here describes how the platform is built.
 */
interface Reward {
  tag: string;
  title: string;
  body: string;
  statLabel: string;
  stat: string;
  notes: string[];
}

const REWARDS: Reward[] = [
  {
    tag: "Prize money",
    title: "Win the pool, not a badge",
    body: "Arenas carry real prize money put up by whoever hosts them. Top three place, paid in EGP, with the split shown on the arena before you enter.",
    statLabel: "Paid by", stat: "The host",
    notes: ["1ST", "2ND", "3RD"],
  },
  {
    tag: "Rating",
    title: "A number you did not write yourself",
    body: "Every judged result moves a Glicko-2 rating in that one domain. Backend work never inflates a frontend score, and nobody can edit it, including us.",
    statLabel: "Domains", stat: "9, rated apart",
    notes: ["EARNED", "PER DOMAIN", "PERMANENT"],
  },
  {
    tag: "Credential",
    title: "One link that survives the interview",
    body: "You leave with a proof packet: the brief, your commits, every judge's score and reasoning. Public, permanent, and readable without an account.",
    statLabel: "Costs", stat: "Nothing",
    notes: ["PUBLIC", "PERMANENT", "YOURS"],
  },
  {
    tag: "Standing",
    title: "A place on the board",
    body: "Every arena publishes its leaderboard, and your rating stacks across all of them. Being good becomes something a stranger can look up.",
    statLabel: "Visible to", stat: "Anyone",
    notes: ["RANKED", "PER ARENA", "CUMULATIVE"],
  },
  {
    tag: "People",
    title: "A team, and the judges who read your work",
    body: "Team arenas put you with people who build at your level under real pressure. The judges are working engineers who then read your code closely.",
    statLabel: "Teams of", stat: "2 to 4",
    notes: ["SQUAD", "PEERS", "JUDGES"],
  },
  {
    tag: "Pipeline",
    title: "Companies read the board",
    body: "Hiring teams shortlist from judged work instead of CVs. A strong packet is a direct route to a conversation, and you decide who may contact you.",
    statLabel: "Contact", stat: "Your call",
    notes: ["SHORTLIST", "NO SCREEN", "CONSENT"],
  },
];

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
  { face: 0, label: "01 Register", value: "Take a seat before the deadline", side: "left", top: "30%", inset: "3%", line: 190 },
  { face: 3, label: "02 Plan", value: "Approach recorded before any code", side: "left", top: "52%", inset: "1%", line: 245 },
  { face: 5, label: "03 Build", value: "Commits sync while the clock runs", side: "left", top: "74%", inset: "5%", line: 164 },
  { face: 2, label: "04 Judge", value: "Named judges, written reasoning", side: "right", top: "26%", inset: "4%", line: 178 },
  { face: 1, label: "05 Results", value: "Leaderboard, rating, prize", side: "right", top: "50%", inset: "1%", line: 238 },
  { face: 4, label: "Then", value: "The packet is yours to keep", side: "right", top: "76%", inset: "6%", line: 156 },
];

/**
 * Flywheel constants. Drag is the only input: scroll used to spin it too, but
 * two sources fighting for one rotation meant the cube moved while you were
 * only reading, and a face could never be parked.
 */
const DRAG_IMPULSE = 0.13;
const FRICTION = 0.94;
const IDLE_DRIFT = 0.018;



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

export function ThreeSidedPerspective() {
  const sectionRef = useRef<HTMLElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const calloutRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef<HTMLSpanElement>(null);


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

      // The cube is ALWAYS fully built. There is no assembly and no teardown.
      //
      // Both used to exist and both were wrong for this. Watching six panels
      // fold together gave the reader nothing sharp to look at - the object was
      // indistinct for most of its screen time - and the reverse on exit was
      // worse, because it competed with the carousel forming below it. The
      // cube now simply descends from above, already whole, and stays. The only
      // thing scroll drives is where it is.
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const scrolled = travel > 0 ? clamp01(-rect.top / travel) : 0;

      vx *= FRICTION;
      vy *= FRICTION;
      rx += vx;
      ry += vy;

      // No detent: the cube rests wherever momentum runs out. Until it is
      // touched, a slow drift keeps it legibly three-dimensional.
      if (!touched && !dragging) ry += IDLE_DRIFT;

      // NEGATIVE, so it starts ABOVE the stage and comes down into it. This
      // was positive and the cube rose from the section below - the opposite of
      // the direction the deck was travelling when it left section 2.
      const arrive = easeOut(clamp01(scrolled / ARRIVE_BY));
      const cubeY = -ARRIVE_FROM * (1 - arrive);

      cube.style.transform =
        `translateY(${cubeY}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      stage.style.pointerEvents = arrive > 0.9 ? "auto" : "none";

      let front = 0;
      let bestZ = -Infinity;

      for (let i = 0; i < 6; i++) {
        const el = faceRefs.current[i];
        if (!el) continue;

        const z = rotateVec(FACE_GEOMETRY[i].normal, rx, ry)[2];
        if (z > bestZ) { bestZ = z; front = i; }

        // Faces stay opaque and are shaded, never faded: a faded card takes its
        // border with it, and the borders are what make a solid read as solid.
        const shade = el.firstElementChild as HTMLElement | null;
        if (shade) shade.style.opacity = String(Math.max(0, 1 - Math.max(0, z)) * 0.5);
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
              [03 / Inside an arena]
            </span>
            <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-none uppercase font-normal">
              What you win
            </h2>
            <p className="font-mono text-[0.58rem] text-[#F1EFE9]/50 uppercase tracking-widest leading-relaxed">
              An arena is a real problem, a clock, and judges who put their names
              to a verdict. Six sides here, one per thing you leave with.
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
            {REWARDS.map((card, i) => (
              <div
                key={card.tag}
                ref={(el) => { faceRefs.current[i] = el; }}
                // Static. The face transform and the panel styling are both
                // fixed now - the cube is never partially built, so there is
                // nothing for either to interpolate between.
                className="absolute inset-0 border border-white/30 bg-[#232320] text-[#F1EFE9] p-5 flex flex-col justify-between shadow-[0_18px_50px_rgba(0,0,0,0.85)]"
                style={{
                  transform: `rotateX(${FACE_GEOMETRY[i].rx}deg) rotateY(${FACE_GEOMETRY[i].ry}deg) translateZ(${HALF}px)`,
                  backfaceVisibility: "hidden",
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
                  <span className="text-orange font-bold font-mono text-[0.52rem] tracking-[0.2em] uppercase border border-orange px-1.5 py-0.5 inline-block">
                    {card.tag}
                  </span>
                  <div className="font-display italic text-[1.25rem] leading-[1.12] tracking-tight">
                    {card.title}
                  </div>
                  <p className="text-[0.8rem] leading-relaxed opacity-70">{card.body}</p>
                </div>

                <div className="relative flex flex-row items-end justify-between gap-3 pt-3 border-t border-dashed border-current/20 mt-3 text-left">
                  <div className="flex flex-col">
                    <span className="font-mono text-[0.4rem] uppercase tracking-[0.25em] opacity-55 mb-1 block font-bold">
                      [{card.statLabel}]
                    </span>
                    <div className="font-mono text-[0.85rem] font-bold leading-none tracking-wider">
                      {card.stat}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[55%]">
                    {card.notes.map((n) => (
                      <span
                        key={n}
                        className="font-mono text-[0.45rem] uppercase tracking-wider font-bold opacity-85"
                      >
                        [{n}]
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
