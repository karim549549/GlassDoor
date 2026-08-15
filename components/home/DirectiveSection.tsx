"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATEMENT_PARTS = [
  { text: "We turn competitive code sprints into ", highlight: false },
  { text: "unforgeable hiring credentials", highlight: true },
  { text: ". Proving what developers can actually build.", highlight: false },
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

      const mm = gsap.matchMedia();

      // Desktop: Pinned scroll lock with character-by-character scrub reveal
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=1200",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          letters,
          {
            opacity: 0.12,
            y: 6,
          },
          {
            opacity: 1,
            y: 0,
            stagger: 0.02,
            ease: "none",
          }
        );
      });

      // Mobile: Smooth progressive reveal without screen lock
      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(
          letters,
          {
            opacity: 0.15,
            y: 4,
          },
          {
            opacity: 1,
            y: 0,
            stagger: 0.01,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              end: "bottom 35%",
              scrub: 0.4,
            },
          }
        );
      });
    }, sectionRef);

    // Refresh ScrollTrigger to calculate exact offsets relative to Section 2's pin spacer
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="directive-section relative min-h-screen bg-[#0E0E0D] text-[#F1EFE9] w-full border-t border-white/10 flex flex-col justify-center items-center py-20 px-6 md:px-12 z-20 overflow-hidden text-center select-none"
    >
      {/* Background blueprint grid overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="directive-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#directive-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-10 flex flex-col items-center">
        {/* Telemetry Header */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/15 bg-white/5 font-mono text-[0.58rem] tracking-[0.25em] uppercase text-orange font-bold">
          <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          <span>DEVS ARENA CORE DIRECTIVE // CAIRO PROTOCOL // 30.0444° N</span>
        </div>

        {/* Large Bold Italic Headline with Pinned Letter-by-Letter Scrub */}
        <h2
          ref={textRef}
          className="font-display italic text-[clamp(2.2rem,5.5vw,4.8rem)] font-normal uppercase tracking-tight leading-[1.08] text-[#F1EFE9] text-balance"
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
              {part.text.split("").map((char, cIdx) => (
                <span
                  key={cIdx}
                  className="scrub-char inline-block opacity-[0.12] will-change-[opacity,transform]"
                  style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                >
                  {char}
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
    </section>
  );
}

export default DirectiveSection;
