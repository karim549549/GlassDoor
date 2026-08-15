"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FoxBackground } from "./FoxBackground";

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 3 — the directive statement with the Nine-Tailed Fox ambient neon & particle background.
 *
 * The section holds still while the statement arrives one line at a time, and
 * scrolling back up takes it apart in reverse.
 *
 * The holding is done by CSS `position: sticky`, not by ScrollTrigger's `pin`.
 */

interface Segment {
  text: string;
  highlight?: boolean;
}

/** One entry per rendered line. Lines are the unit of the reveal. */
const STATEMENT_LINES: Segment[][] = [
  [{ text: "We turn competitive" }],
  [{ text: "code sprints into" }],
  [{ text: "unforgeable hiring", highlight: true }],
  [{ text: "credentials.", highlight: true }],
  [{ text: "Proving what developers" }],
  [{ text: "can actually build." }],
];

export function DirectiveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    if (!section || !textEl) return;

    const ctx = gsap.context(() => {
      const lines = textEl.querySelectorAll<HTMLElement>(".directive-line");
      if (lines.length === 0) return;

      // 1. Neon Fox Artwork Scroll Fade-in & Scale
      gsap.fromTo(
        ".fox-neon-art",
        { opacity: 0, scale: 0.88, filter: "drop-shadow(0 0 10px rgba(255,107,0,0.1))" },
        {
          opacity: 0.9,
          scale: 1,
          filter: "drop-shadow(0 0 45px rgba(255,107,0,0.65))",
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "center center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      // 2. Lines reveal one by one with scrub: 1
      gsap.fromTo(
        lines,
        { opacity: 0, y: 46, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 1,
          ease: "back.out(2.2)",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    // Tall outer section supplies the scroll distance; the sticky stage inside
    // is what the reader actually sees holding still.
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

        {/* Nine-Tailed Fox Neon & Floating Embers Background */}
        <FoxBackground sectionRef={sectionRef} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10 flex flex-col items-center">
          {/* Telemetry Header */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/15 bg-white/5 font-mono text-[0.58rem] tracking-[0.25em] uppercase text-orange font-bold">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            <span>DEVS ARENA CORE DIRECTIVE // CAIRO PROTOCOL // 30.0444° N</span>
          </div>

          {/* Line-by-line reveal */}
          <h2
            ref={textRef}
            className="font-display italic text-[clamp(2.2rem,5.5vw,4.8rem)] font-normal uppercase tracking-tight leading-[1.08] text-balance"
          >
            {STATEMENT_LINES.map((segments, lineIdx) => (
              <span
                key={lineIdx}
                className="directive-line block opacity-0 will-change-[opacity,transform]"
              >
                {segments.map((seg, segIdx) => (
                  <span
                    key={segIdx}
                    className={
                      seg.highlight
                        ? "text-orange underline decoration-orange/40 underline-offset-8"
                        : "text-[#F1EFE9]"
                    }
                  >
                    {seg.text}
                  </span>
                ))}
              </span>
            ))}
          </h2>

          {/* Sub-telemetry readout */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[0.55rem] text-[#F1EFE9]/60 uppercase tracking-[0.2em] pt-4 border-t border-white/10">
            <span>&gt; AUTOMATED CODE RUNNER VERIFICATION</span>
            <span>&bull;</span>
            <span>&gt; GLICKO-2 DOMAIN LEDGER</span>
            <span>&bull;</span>
            <span>&gt; SHA-256 PROOF PACKETS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DirectiveSection;
