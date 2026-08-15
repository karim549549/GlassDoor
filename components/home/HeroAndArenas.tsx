"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import { KineticDirectiveStatement } from "./KineticDirectiveStatement";
import { ThreeSidedPerspective } from "./ThreeSidedPerspective";
import { InteractiveProofVisualizer } from "./InteractiveProofVisualizer";
import { GlickoLedgerExplorer } from "./GlickoLedgerExplorer";
import { ConversionTerminal } from "./ConversionTerminal";

export function HeroAndArenas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arenasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative overflow-visible bg-background">
      {/* SECTION 1: Magazine Editorial Hero Section */}
      <HeroSection />

      {/* SECTION 2: Pinned 3-Card Docking Arenas Section (Morphs to Dark Mode #0E0E0D) */}
      <ArenasSection ref={arenasRef} containerRef={containerRef} />

      {/* SECTION 3: The Directive & Stacked Cards Stage (.pink-section-container - Unified Dark Mode #0E0E0D) */}
      <div className="pink-section-container h-auto py-20 md:h-screen md:min-h-screen bg-[#0E0E0D] text-[#F1EFE9] w-full border-t border-white/10 relative flex flex-col justify-center items-center md:py-12 z-10 transition-colors duration-300 overflow-visible">
        {/* Subtle Blueprint Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="section3-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#section3-grid)" />
          </svg>
        </div>

        {/* 2-Column Content Wrapper */}
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-12 relative z-10 pointer-events-none">
          {/* Left Column: Kinetic Character-by-Character Directive Statement */}
          <div className="w-full md:w-1/2 flex flex-col justify-center text-left pointer-events-auto pr-0 md:pr-6">
            <KineticDirectiveStatement />
          </div>

          {/* Column Divider Line */}
          <div className="hidden md:block w-px h-[480px] bg-white/10 self-center mx-6" />

          {/* Right Column Spacer: Provides layout alignment for the stacked cards at x: 420, y: 100vh */}
          <div className="hidden md:block md:w-1/2 md:h-[420px] relative pointer-events-none" />
        </div>
      </div>

      {/* CHAPTER 4: Three-Sided Interactive Console (Light Cream #F1EFE9) */}
      <ThreeSidedPerspective />

      {/* CHAPTER 5: Interactive Proof Packet Cryptographic Inspector */}
      <InteractiveProofVisualizer />

      {/* CHAPTER 6: Glicko-2 Multi-Domain Mathematical Ledger (Cyber Dark #070a0d) */}
      <GlickoLedgerExplorer />

      {/* CHAPTER 7: Cybernetic Conversion Terminal (Obsidian #050708) */}
      <ConversionTerminal />
    </div>
  );
}

export default HeroAndArenas;
