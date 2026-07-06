"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";

export function HeroAndArenas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arenasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative overflow-visible bg-[#F1EFE9]">
      {/* Hero Section */}
      <HeroSection />

      {/* Arenas Section */}
      <ArenasSection ref={arenasRef} containerRef={containerRef} />

      {/* Third Section - Starts dark (matching Section 2) and morphs to light cream (matching Section 1) */}
      <div className="pink-section-container h-screen min-h-screen bg-[#0E0E0D] text-[#F1EFE9] w-full border-t border-[#0E0E0D]/10 relative flex items-center justify-between px-6 md:px-12 z-10 transition-colors duration-300 overflow-visible">
        {/* Editorial Blueprint Grid Backdrop Overlay */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="section3-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.55" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#section3-grid)" />
          </svg>
        </div>
      </div>

      {/* Fourth Section - Dark brutalist editorial layout block */}
      <section className="fourth-section-container h-screen min-h-screen bg-[#0E0E0D] text-[#F1EFE9] w-full relative flex items-center justify-between px-6 md:px-12 z-10 border-t border-[#FAF8F5]/10">
        {/* Decorative Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="section4-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.55" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#section4-grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-8 z-10 relative text-left">
          <div className="space-y-4 max-w-xl">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.25em] text-orange font-bold block animate-pulse">
              [04 / ARCHIVE]
            </span>
            <h2 className="font-display italic text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] uppercase font-normal">
              Arena History &amp; Metrics
            </h2>
            <p className="font-mono text-[0.58rem] text-muted-foreground uppercase tracking-widest leading-relaxed">
              Inspect historical records, verify system protocols, and monitor developer benchmark profiles.
            </p>
          </div>

          <div className="border-t-2 md:border-t-0 md:border-l-2 border-dashed border-[#FAF8F5]/20 pt-6 md:pt-0 md:pl-12 flex flex-col gap-6 font-mono text-[0.52rem] uppercase tracking-[0.2em] text-muted-foreground justify-center">
            <div>
              <span className="text-orange font-bold block mb-1">[01 // STATISTICS]</span>
              <span>1,240 Total matches completed</span>
            </div>
            <div>
              <span className="text-orange font-bold block mb-1">[02 // PAYOUTS]</span>
              <span>EGP 450,000 distributed prize pools</span>
            </div>
            <div>
              <span className="text-orange font-bold block mb-1">[03 // REPUTATION]</span>
              <span>Global leaderboard and rank profiles active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Scroll Height Buffer (Dark spacer to allow natural scrolling to complete at the end of Section 4) */}
      <div className="h-[80vh] bg-[#0E0E0D] w-full" />
    </div>
  );
}
export default HeroAndArenas;
