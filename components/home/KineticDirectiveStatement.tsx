"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Terminal, ShieldCheck, Cpu } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const STATEMENT_WORDS = [
  { text: "We", isHighlight: false },
  { text: "turn", isHighlight: false },
  { text: "competitive", isHighlight: false },
  { text: "code", isHighlight: false },
  { text: "sprints", isHighlight: false },
  { text: "into", isHighlight: false },
  { text: "unforgeable", isHighlight: true },
  { text: "hiring", isHighlight: true },
  { text: "credentials", isHighlight: true },
  { text: ".", isHighlight: false },
  { text: "Proving", isHighlight: false },
  { text: "what", isHighlight: false },
  { text: "developers", isHighlight: false },
  { text: "can", isHighlight: false },
  { text: "actually", isHighlight: false },
  { text: "build.", isHighlight: false },
];

export function KineticDirectiveStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const textEl = textRef.current;
    if (!el || !textEl) return;

    const ctx = gsap.context(() => {
      const chars = textEl.querySelectorAll(".scrub-char");

      // Character-by-character scrubbed progressive illumination timeline
      gsap.fromTo(
        chars,
        {
          opacity: 0.15,
          y: 6,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.03,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "bottom 35%",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-8 max-w-xl text-left pointer-events-auto">
      {/* Telemetry Header */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 border border-white/15 bg-white/5 font-mono text-[0.55rem] tracking-[0.22em] uppercase text-orange font-bold">
        <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
        <span>[03 // DIRECTIVE] CAIRO PROTOCOL</span>
      </div>

      {/* Kinetic Character-by-Character Headline */}
      <h2
        ref={textRef}
        className="font-display italic text-[clamp(1.75rem,3.2vw,2.85rem)] font-normal uppercase tracking-tight leading-[1.1] text-[#F1EFE9] select-none"
      >
        {STATEMENT_WORDS.map((word, wIdx) => (
          <span
            key={wIdx}
            className={`inline-block mr-2.5 ${
              word.isHighlight
                ? "text-orange font-bold underline decoration-orange/40 underline-offset-6"
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

      {/* Technical Protocol Notes */}
      <div className="space-y-3 font-mono text-[0.58rem] text-[#F1EFE9]/70 uppercase tracking-wider border-l-2 border-orange pl-4 py-1">
        <p className="leading-relaxed">
          &gt; SOLUTIONS COMPILED &amp; TESTED VIA AUTOMATED CODE RUNNERS.
        </p>
        <p className="leading-relaxed">
          &gt; NAMED SENIOR JUDGES SCORE RUBRICS WITH CONFLICT-OF-INTEREST GUARDS.
        </p>
        <p className="leading-relaxed">
          &gt; SHA-256 PROOF PACKETS ISSUED DIRECTLY TO VERIFIABLE DEV GRAPH.
        </p>
      </div>

      {/* Standings Action CTA */}
      <div className="pt-2">
        <Link
          href="/billboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-card border border-orange font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-card hover:text-foreground hover:border-foreground transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-0.5"
        >
          <span>VIEW STANDINGS BILLBOARD</span>
          <span className="font-sans font-normal text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}
