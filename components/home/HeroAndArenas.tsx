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

      {/* Pinned release buffer section (colored pink as requested after the scroll lock unpins) */}
      <div className="h-[80vh] bg-[#FF8DA1] w-full border-t border-[#FF8DA1]" />
    </div>
  );
}
export default HeroAndArenas;
