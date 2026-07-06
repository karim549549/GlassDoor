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

      {/* Pink Section - Sized as full screen height (100vh) where cards re-stack on the right */}
      <div className="pink-section-container h-screen min-h-screen bg-[#FF8DA1] w-full border-t border-[#FF8DA1] relative flex items-center justify-between px-6 md:px-12 z-10" />

      {/* Extra Scroll Height Buffer (Dark spacer to allow ScrollTrigger to complete fully on short pages) */}
      <div className="h-[80vh] bg-[#0E0E0D] w-full" />
    </div>
  );
}
export default HeroAndArenas;
