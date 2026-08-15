"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Cpu, Terminal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function StatementSection() {
  const containerRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    const headline = headlineRef.current;
    const cards = cardsRef.current;
    if (!el || !headline || !cards) return;

    const ctx = gsap.context(() => {
      // Scrubbed word illumination
      const words = headline.querySelectorAll(".scrub-word");
      gsap.fromTo(
        words,
        { opacity: 0.18, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            end: "top 25%",
            scrub: 0.6,
          },
        }
      );

      // Cards staggered rise
      const cardEls = cards.querySelectorAll(".statement-pillar-card");
      gsap.fromTo(
        cardEls,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cards,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-20 w-full py-28 md:py-44 px-6 md:px-12 bg-foreground text-background border-b border-background/20 flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-500"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Telemetry Header */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-background/20 bg-card/10 font-mono text-[0.58rem] tracking-[0.25em] uppercase text-background/80">
          <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          <span>DEVS ARENA DIRECTIVE // CAIRO PROTOCOL // 30.0444° N</span>
        </div>

        {/* High-Impact Statement with Scrubbed Word Illumination */}
        <h2
          ref={headlineRef}
          className="font-display italic text-[clamp(2.2rem,5.8vw,4.8rem)] font-normal uppercase tracking-tight leading-[1.08] text-background text-balance select-none"
        >
          <span className="scrub-word inline-block mr-2.5">We</span>
          <span className="scrub-word inline-block mr-2.5">turn</span>
          <span className="scrub-word inline-block mr-2.5">competitive</span>
          <span className="scrub-word inline-block mr-2.5">code</span>
          <span className="scrub-word inline-block mr-2.5">sprints</span>
          <span className="scrub-word inline-block mr-2.5">into</span>
          <span className="scrub-word inline-block mr-2.5 text-orange underline decoration-orange/40 underline-offset-8">
            unforgeable
          </span>
          <span className="scrub-word inline-block mr-2.5 text-orange underline decoration-orange/40 underline-offset-8">
            hiring
          </span>
          <span className="scrub-word inline-block mr-2.5 text-orange underline decoration-orange/40 underline-offset-8">
            credentials
          </span>
          <span className="scrub-word inline-block mr-2.5">.</span>
          <span className="scrub-word inline-block mr-2.5">Proving</span>
          <span className="scrub-word inline-block mr-2.5">what</span>
          <span className="scrub-word inline-block mr-2.5">developers</span>
          <span className="scrub-word inline-block mr-2.5">can</span>
          <span className="scrub-word inline-block mr-2.5">actually</span>
          <span className="scrub-word inline-block">build.</span>
        </h2>

        {/* 3 Value Pillars with Kinetic Rise & Hover Physics */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          <div className="statement-pillar-card p-6 border-2 border-background/20 bg-background/5 hover:bg-background/10 hover:border-orange transition-all duration-300 space-y-3 shadow-[4px_4px_0px_0px_rgba(255,107,0,0.2)] hover:-translate-y-1">
            <div className="flex items-center gap-2 font-mono text-[0.58rem] text-orange uppercase tracking-widest font-bold">
              <Terminal className="w-4 h-4" />
              <span>01 / NO RESUME FLUFF</span>
            </div>
            <p className="font-sans text-xs text-background/85 leading-relaxed">
              Technical capability evaluated strictly through compiled code, commit trajectories, and rubric-scored system architectures.
            </p>
          </div>

          <div className="statement-pillar-card p-6 border-2 border-background/20 bg-background/5 hover:bg-background/10 hover:border-orange transition-all duration-300 space-y-3 shadow-[4px_4px_0px_0px_rgba(255,107,0,0.2)] hover:-translate-y-1">
            <div className="flex items-center gap-2 font-mono text-[0.58rem] text-orange uppercase tracking-widest font-bold">
              <Cpu className="w-4 h-4" />
              <span>02 / GLICKO-2 PRECISION</span>
            </div>
            <p className="font-sans text-xs text-background/85 leading-relaxed">
              Domain-specific rating ledger that tracks skill, statistical uncertainty (RD), and volatility over time across Backend, Web, and AI.
            </p>
          </div>

          <div className="statement-pillar-card p-6 border-2 border-background/20 bg-background/5 hover:bg-background/10 hover:border-orange transition-all duration-300 space-y-3 shadow-[4px_4px_0px_0px_rgba(255,107,0,0.2)] hover:-translate-y-1">
            <div className="flex items-center gap-2 font-mono text-[0.58rem] text-orange uppercase tracking-widest font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>03 / TAMPER-EVIDENT SEALS</span>
            </div>
            <p className="font-sans text-xs text-background/85 leading-relaxed">
              Every sprint outcome produces a SHA-256 cryptographic Proof Packet that employers verify with 1-click on the public ledger.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
