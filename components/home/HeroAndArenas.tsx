"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import DirectiveSection from "./DirectiveSection";
import { ThreeSidedPerspective } from "./ThreeSidedPerspective";
import { InteractiveProofVisualizer } from "./InteractiveProofVisualizer";
import { GlickoLedgerExplorer } from "./GlickoLedgerExplorer";
import { ConversionTerminal } from "./ConversionTerminal";
import type { ArenaCardData } from "./Hero/arena-cards-data";

export function HeroAndArenas({
  cards,
  openCount = 0,
}: {
  cards?: ArenaCardData[];
  openCount?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const arenasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative overflow-visible bg-background">
      {/* SECTION 1: Magazine Editorial Hero Section */}
      <HeroSection openCount={openCount} />

      {/* SECTION 2: Pinned 3-Card Docking Arenas Section (Dark Mode #0E0E0D) */}
      <ArenasSection ref={arenasRef} containerRef={containerRef} cards={cards} />

      {/* SECTION 3: Pinned Directive Statement with Character-by-Character Scrub (Dark Mode #0E0E0D) */}
      <DirectiveSection />

      {/* CHAPTER 4: Three-Sided Interactive Console (Light Cream #F1EFE9) */}
      <ThreeSidedPerspective cards={cards} />

      {/* CHAPTER 5: Interactive Proof Packet Cryptographic Inspector & Reunited Arena Cards Carousel */}
      <InteractiveProofVisualizer cards={cards} />

      {/* CHAPTER 6: Glicko-2 Multi-Domain Mathematical Ledger (Cyber Dark #070a0d) */}
      <GlickoLedgerExplorer />

      {/* CHAPTER 7: Cybernetic Conversion Terminal (Obsidian #050708) */}
      <ConversionTerminal />
    </div>
  );
}

export default HeroAndArenas;
