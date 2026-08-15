"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import DirectiveStatementSection from "./DirectiveStatementSection";
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

      {/* SECTION 3: Bold Centered Directive Statement with Character-by-Character Kinetic Scrub */}
      <DirectiveStatementSection />

      {/* SECTION 4: Three-Sided Interactive Console (Light Cream #F1EFE9) */}
      <ThreeSidedPerspective />

      {/* SECTION 5: Interactive Proof Packet Cryptographic Inspector */}
      <InteractiveProofVisualizer />

      {/* SECTION 6: Glicko-2 Multi-Domain Mathematical Ledger (Cyber Dark #070a0d) */}
      <GlickoLedgerExplorer />

      {/* SECTION 7: Cybernetic Conversion Terminal (Obsidian #050708) */}
      <ConversionTerminal />
    </div>
  );
}

export default HeroAndArenas;
