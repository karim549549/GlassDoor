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
      <div className="pink-section-container h-screen min-h-screen bg-[#0E0E0D] text-[#F1EFE9] w-full border-t border-[#0E0E0D]/10 relative flex flex-col justify-center items-center py-12 z-10 transition-colors duration-300 overflow-visible">
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

        {/* Content Columns Wrapper */}
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center gap-8 relative z-10 pointer-events-none">
          
          <div className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-12 pointer-events-none">
            {/* Left Column: Asymmetrical Editorial Arena Rules Box */}
            <div className="w-full md:w-1/2 flex flex-col justify-center text-left pointer-events-auto pr-0 md:pr-4 max-w-xl">
              
              {/* The 4-Floor Unified Brutalist Grid Box */}
              <div className="w-full border-4 border-double border-current bg-[#FAF8F5]/5 flex flex-col h-[520px] shadow-[4px_4px_0px_0px_currentColor] relative">
                
                {/* Floor 1: Identifier & Section Header */}
                <div className="flex-1 flex flex-col justify-between p-5 border-b border-current/15">
                  <span className="font-mono text-[0.45rem] text-orange uppercase tracking-[0.25em] font-bold block">
                    [01 / IDENTIFIER]
                  </span>
                  <div className="font-display italic text-[clamp(1.5rem,2.2vw,2rem)] font-normal uppercase tracking-tight leading-none">
                    ARENA RULES
                  </div>
                  <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Cairo issue 001 · System specifications &amp; integrity.
                  </p>
                </div>

                {/* Floor 2: Registry Rules */}
                <div className="flex-1 flex flex-col justify-between p-5 border-b border-current/15">
                  <span className="font-mono text-[0.45rem] text-muted-foreground uppercase tracking-[0.25em] font-bold block">
                    [02 / REGISTRY]
                  </span>
                  <div className="font-mono text-[clamp(1.1rem,1.8vw,1.45rem)] font-bold uppercase tracking-tight leading-none">
                    GITHUB VERIFICATION
                  </div>
                  <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Active EGP salaries feed requires a verified developer account.
                  </p>
                </div>

                {/* Floor 3: Timeframe Rules */}
                <div className="flex-1 flex flex-col justify-between p-5 border-b border-current/15">
                  <span className="font-mono text-[0.45rem] text-muted-foreground uppercase tracking-[0.25em] font-bold block">
                    [03 / TIMEFRAME]
                  </span>
                  <div className="font-mono text-[clamp(1.1rem,1.8vw,1.45rem)] font-bold uppercase tracking-tight leading-none">
                    6-HOUR CODE SPRINT
                  </div>
                  <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Solutions must be submitted before the countdown lobby ticks to zero.
                  </p>
                </div>

                {/* Floor 4: Integrity Rules */}
                <div className="flex-1 flex flex-col justify-between p-5">
                  <span className="font-mono text-[0.45rem] text-muted-foreground uppercase tracking-[0.25em] font-bold block">
                    [04 / INTEGRITY]
                  </span>
                  <div className="font-mono text-[clamp(1.1rem,1.8vw,1.45rem)] font-bold uppercase tracking-tight leading-none">
                    OPEN-SOURCE PROOFS
                  </div>
                  <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed">
                    All submissions require a repository link and a functional live demo.
                  </p>
                </div>

              </div>
            </div>

            {/* Column Divider Line */}
            <div className="hidden md:block w-px h-[520px] bg-current/15 self-center mx-8" />

            {/* Right Column Spacer (Provides layout alignment for the absolute stacked cards) */}
            <div className="w-full md:w-1/2 h-[350px] relative pointer-events-none" />
          </div>

          {/* Centered Billboard standings redirect button */}
          <div className="w-full flex justify-center mt-6 pointer-events-auto">
            <a
              href="/billboard"
              className="px-8 py-3.5 bg-orange text-[#FAF8F5] border border-orange font-mono text-[0.65rem] font-bold tracking-[0.25em] uppercase hover:bg-[#FAF8F5] hover:text-[#0E0E0D] hover:border-[#0E0E0D] transition-colors shadow-[4px_4px_0px_0px_currentColor] hover:shadow-[6px_6px_0px_0px_currentColor] active:translate-y-0.5 flex items-center gap-2"
            >
              View Standings Billboard <span className="font-sans font-normal text-xs">→</span>
            </a>
          </div>

        </div>
      </div>

      {/* Extra Scroll Height Buffer (Light spacer to allow natural scrolling to complete at the end of Section 3) */}
      <div className="h-[80vh] bg-[#F1EFE9] w-full" />
    </div>
  );
}
export default HeroAndArenas;
