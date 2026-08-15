"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FoxBackground } from "./FoxBackground";

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 3 — The Directive Statement with the Nine-Tailed Fox Neon Background.
 * Matches the reference design mockup with 100% precision.
 */

const STATEMENT_LINES = [
  { text: "WE TURN COMPETITIVE", highlight: false },
  { text: "CODE SPRINTS INTO", highlight: false },
  { text: "UNFORGEABLE HIRING", highlight: true },
  { text: "CREDENTIALS.", highlight: true, underline: true },
  { text: "PROVING WHAT DEVELOPERS", highlight: false },
  { text: "CAN ACTUALLY BUILD.", highlight: false },
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

      gsap.fromTo(
        lines,
        { opacity: 0.15, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "center 45%",
            scrub: 0.6,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="directive-section relative min-h-[90vh] md:min-h-screen bg-[#07090c] text-[#F1EFE9] w-full border-t border-white/10 flex flex-col justify-center items-center py-20 px-6 md:px-12 z-20 overflow-hidden select-none"
    >
      {/* Background blueprint grid overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="directive-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#directive-grid)" />
        </svg>
      </div>

      {/* Centered Glowing Neon Nine-Tailed Fox Artwork & Floating Embers */}
      <FoxBackground sectionRef={sectionRef} />

      {/* Centered Headline Lockup matching Reference Design */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-4">
        <h2
          ref={textRef}
          className="font-display italic uppercase tracking-tight text-center leading-[1.12] text-[clamp(1.75rem,4vw,3.4rem)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
        >
          {STATEMENT_LINES.map((line, idx) => (
            <span
              key={idx}
              className={`directive-line block ${
                line.highlight
                  ? "text-[#FF6B00] font-normal"
                  : "text-white font-normal"
              } ${
                line.underline
                  ? "underline decoration-[#FF6B00] decoration-2 underline-offset-6"
                  : ""
              }`}
            >
              {line.text}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}

export default DirectiveSection;
