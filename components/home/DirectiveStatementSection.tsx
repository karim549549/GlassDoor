"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WORDS = [
  { text: "We", highlight: false },
  { text: "turn", highlight: false },
  { text: "competitive", highlight: false },
  { text: "code", highlight: false },
  { text: "sprints", highlight: false },
  { text: "into", highlight: false },
  { text: "unforgeable", highlight: true },
  { text: "hiring", highlight: true },
  { text: "credentials", highlight: true },
  { text: ".", highlight: false },
  { text: "Proving", highlight: false },
  { text: "what", highlight: false },
  { text: "developers", highlight: false },
  { text: "can", highlight: false },
  { text: "actually", highlight: false },
  { text: "build.", highlight: false },
];

export function DirectiveStatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    if (!section || !textEl) return;

    const ctx = gsap.context(() => {
      const chars = textEl.querySelectorAll(".scrub-char");

      // Character-by-character kinetic scrub timeline
      gsap.fromTo(
        chars,
        {
          opacity: 0.15,
          color: "rgba(241, 239, 233, 0.18)",
          scale: 0.98,
        },
        {
          opacity: 1,
          color: "#F1EFE9",
          scale: 1,
          stagger: 0.02,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "center 40%",
            scrub: 0.5,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pink-section-container relative min-h-[90vh] md:min-h-screen bg-[#0E0E0D] text-[#F1EFE9] w-full border-t border-white/10 flex flex-col justify-center items-center py-24 md:py-36 px-6 md:px-12 z-20 transition-colors duration-300 overflow-hidden text-center"
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

      <div className="relative z-10 max-w-5xl mx-auto space-y-12 flex flex-col items-center">
        {/* Telemetry Header */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-white/15 bg-white/5 font-mono text-[0.58rem] tracking-[0.25em] uppercase text-orange font-bold">
          <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          <span>DEVS ARENA CORE DIRECTIVE // CAIRO PROTOCOL // 30.0444° N</span>
        </div>

        {/* Large Centered Bold Typography with Character-by-Character Scrub */}
        <h2
          ref={textRef}
          className="font-display italic text-[clamp(2.2rem,5.5vw,4.8rem)] font-normal uppercase tracking-tight leading-[1.08] text-[#F1EFE9] text-balance select-none"
        >
          {WORDS.map((word, wIdx) => (
            <span
              key={wIdx}
              className={`inline-block mr-2.5 sm:mr-3.5 ${
                word.highlight
                  ? "text-orange underline decoration-orange/40 underline-offset-8"
                  : "text-[#F1EFE9]"
              }`}
            >
              {word.text.split("").map((char, cIdx) => (
                <span key={cIdx} className="scrub-char inline-block will-change-transform">
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h2>

        {/* Standings Billboard Action CTA */}
        <div className="pt-4">
          <Link
            href="/billboard"
            className="px-8 py-3.5 bg-orange text-card border border-orange font-mono text-[0.65rem] font-bold tracking-[0.25em] uppercase hover:bg-card hover:text-foreground hover:border-foreground transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-0.5 inline-flex items-center gap-2"
          >
            <span>View Standings Billboard</span>
            <span className="font-sans font-normal text-xs">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DirectiveStatementSection;
