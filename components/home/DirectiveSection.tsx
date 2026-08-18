"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * three.js is 645KB uncompressed - 40% of this page's entire initial JS - and
 * a static import put it in the homepage's prerendered HTML, downloaded and
 * parsed before hydration for a decorative background that lives in section 3
 * and is invisible until the reader scrolls to it.
 *
 * `ssr: false` because it is a WebGL canvas: it renders nothing on the server,
 * so server-rendering it only pays the cost twice. There is no loading
 * placeholder for the same reason the component is decorative - the section
 * reads correctly with no fox at all, and a skeleton in its place would be a
 * visible regression rather than a fallback.
 */
const FoxBackground = dynamic(
  () => import("./FoxBackground").then((m) => m.FoxBackground),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger);

/**
 * The largest text on the page, held through a pinned scroll.
 *
 * It used to read "We turn competitive code sprints into unforgeable hiring
 * credentials", which is the pitch for the side of the business that is not yet
 * for sale, aimed at people who arrived to have fun. See PRD 1.2: developers
 * are the supply, not the customer, and copy that makes entering sound like an
 * assessment suppresses the participation everything else depends on.
 *
 * This says what actually happens instead, and ends on the one thing an
 * auto-graded site cannot offer.
 */
const STATEMENT_PARTS = [
  { text: "The brief drops. The clock starts. Then ", highlight: false },
  { text: "a real engineer reads your code", highlight: true },
  { text: " and tells you exactly what they thought of it.", highlight: false },
];

export function DirectiveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    if (!section || !textEl) return;

    const ctx = gsap.context(() => {
      const letters = textEl.querySelectorAll(".scrub-char");
      if (!letters || letters.length === 0) return;

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Text reveal begins immediately: letters start TOTALLY HIDDEN (opacity: 0) and scrub in
      masterTimeline.fromTo(
        letters,
        {
          opacity: 0,
          y: 12,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.02,
          ease: "none",
          duration: 1,
        },
        0
      );

      // The fox is no longer driven from here. `FoxBackground` reads this
      // section's own rect every frame inside its render loop, so its ignition
      // stays locked to scroll position without a second timeline that could
      // drift from this one - and it reverses for free on the way back up.
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="directive-section relative h-[260vh] bg-[#0E0E0D] text-[#F1EFE9] w-full border-t border-white/10 z-20 select-none"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center px-6 md:px-12 text-center">
        {/* Background blueprint grid overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="directive-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#directive-grid)" />
          </svg>
        </div>

        {/* Nine-Tailed Fox Neon & Floating Embers Background (Appears after 50% text reveal) */}
        <FoxBackground sectionRef={sectionRef} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10 flex flex-col items-center">
          {/* Telemetry Header */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/15 bg-white/5 font-mono text-[0.58rem] tracking-[0.25em] uppercase text-orange font-bold">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            <span>DEVS ARENA CORE DIRECTIVE // CAIRO PROTOCOL // 30.0444° N</span>
          </div>

          {/* Original Typography & Styling: Letters start totally hidden and reveal via scroll */}
          <h2
            ref={textRef}
            /* Two shadows doing two different jobs. The tight one is a dark
               contact edge that separates the glyph from whatever is directly
               behind it - that is what keeps thin serif strokes readable over
               the fire. The wide one is an ambient pool that lifts the whole
               block off the background. One shadow alone does neither well. */
            style={{
              textShadow:
                "0 0 4px rgba(0,0,0,0.98), 0 0 10px rgba(0,0,0,0.92), 0 6px 34px rgba(0,0,0,0.85)",
            }}
            className="font-display italic text-[clamp(2.2rem,5.5vw,4.8rem)] font-normal uppercase tracking-tight leading-[1.08] text-[#F1EFE9] text-balance select-none"
          >
            {STATEMENT_PARTS.map((part, pIdx) => (
              <span
                key={pIdx}
                className={
                  part.highlight
                    ? "text-orange underline decoration-orange/40 underline-offset-8 inline"
                    : "text-[#F1EFE9] inline"
                }
              >
                {/* Split into WORDS first, then characters inside them.
                    Every character used to be its own inline-block, which let
                    the browser break a line in the middle of a word -
                    "credentials" wrapping as "creden / tials" - so the
                    statement was unreadable at most widths. Each word is now an
                    atomic inline-block that cannot be split; the characters
                    inside it still animate individually. */}
                {part.text.split(/(\s+)/).map((token, tIdx) =>
                  /^\s+$/.test(token) ? (
                    <span key={tIdx} style={{ whiteSpace: "pre" }}>
                      {token}
                    </span>
                  ) : (
                    <span key={tIdx} className="inline-block whitespace-nowrap">
                      {token.split("").map((char, cIdx) => (
                        <span
                          key={cIdx}
                          className="scrub-char inline-block opacity-0 will-change-[opacity,transform]"
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  )
                )}
              </span>
            ))}
          </h2>

          {/* Sub-telemetry readout */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[0.55rem] text-[#F1EFE9]/60 uppercase tracking-[0.2em] pt-4 border-t border-white/10">
            {/* Was "AUTOMATED CODE RUNNER VERIFICATION / GLICKO-2 DOMAIN
                LEDGER / SHA-256 PROOF PACKETS" - the implementation, printed
                under the page's biggest sentence. All three exist; none of them
                answers "why would I spend Saturday on this". */}
            <span>&gt; SOLO OR TEAMS OF 2&ndash;4</span>
            <span>&bull;</span>
            <span>&gt; ONLINE OR IN A ROOM IN CAIRO</span>
            <span>&bull;</span>
            <span>&gt; NO ENTRY FEE</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DirectiveSection;
