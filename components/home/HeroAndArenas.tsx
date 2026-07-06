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

      {/* Extra Scroll Height Buffer (Light spacer to blend with final Section 3 background) */}
      <div className="h-[80vh] bg-[#F1EFE9] w-full" />
    </div>
  );
}
export default HeroAndArenas;
