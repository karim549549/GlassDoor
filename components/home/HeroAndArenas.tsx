"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import HeroArenaCard from "./Hero/HeroArenaCard";

export function HeroAndArenas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arenasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative overflow-visible bg-[#F1EFE9]">
      {/* Hero Section */}
      <HeroSection />

      {/* Arenas Section */}
      <ArenasSection ref={arenasRef} />

      {/* Extra Scroll Height Buffer (Dark spacer to allow ScrollTrigger to complete fully on short pages) */}
      <div className="h-[80vh] bg-[#0E0E0D] w-full" />

      {/* Floating Animated Cards Stack */}
      <HeroArenaCard containerRef={containerRef} arenasRef={arenasRef} />
    </div>
  );
}
export default HeroAndArenas;
