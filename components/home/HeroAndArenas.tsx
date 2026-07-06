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

      {/* Arenas Section (Now houses the card deck stack inside its layout context) */}
      <ArenasSection ref={arenasRef} containerRef={containerRef} />

      {/* Extra Scroll Height Buffer (Dark spacer to allow ScrollTrigger to complete fully on short pages) */}
      <div className="h-[80vh] bg-[#0E0E0D] w-full" />
    </div>
  );
}
export default HeroAndArenas;
