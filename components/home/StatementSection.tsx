"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Cpu, Terminal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function StatementSection() {
  const containerRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    const text = textRef.current;
    if (!el || !text) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        text,
        { opacity: 0.25, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "top 30%",
            scrub: 0.8,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-20 w-full py-28 md:py-40 px-6 md:px-12 bg-background border-b border-foreground/20 flex flex-col items-center justify-center text-center overflow-hidden"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Telemetry Header */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-foreground/20 bg-card font-mono text-[0.58rem] tracking-[0.25em] uppercase text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          <span>DEVS ARENA CORE DIRECTIVE · 30.0444° N, 31.2357° E</span>
        </div>

        {/* High-Impact Statement */}
        <h2
          ref={textRef}
          className="font-display italic text-[clamp(2rem,5.5vw,4.5rem)] font-normal uppercase tracking-tight leading-[1.06] text-foreground text-balance"
        >
          We turn competitive code sprints into{" "}
          <span className="text-orange underline decoration-orange/40 underline-offset-8">
            unforgeable hiring credentials
          </span>
          . Proving what developers can actually build.
        </h2>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
          <div className="p-6 border border-foreground/15 bg-card/60 space-y-3">
            <div className="flex items-center gap-2 font-mono text-[0.55rem] text-orange uppercase tracking-widest font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>01 / NO RESUME FLUFF</span>
            </div>
            <p className="font-sans text-xs text-foreground/80 leading-relaxed">
              Technical capability evaluated strictly through compiled code, commit trajectories, and rubric-scored system architectures.
            </p>
          </div>

          <div className="p-6 border border-foreground/15 bg-card/60 space-y-3">
            <div className="flex items-center gap-2 font-mono text-[0.55rem] text-orange uppercase tracking-widest font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>02 / GLICKO-2 PRECISION</span>
            </div>
            <p className="font-sans text-xs text-foreground/80 leading-relaxed">
              Domain-specific rating ledger that tracks skill, uncertainty (RD), and volatility over time across Backend, Web, and AI.
            </p>
          </div>

          <div className="p-6 border border-foreground/15 bg-card/60 space-y-3">
            <div className="flex items-center gap-2 font-mono text-[0.55rem] text-orange uppercase tracking-widest font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>03 / TAMPER-EVIDENT SEALS</span>
            </div>
            <p className="font-sans text-xs text-foreground/80 leading-relaxed">
              Every sprint outcome produces a SHA-256 cryptographic Proof Packet that employers verify with 1-click on the public ledger.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
