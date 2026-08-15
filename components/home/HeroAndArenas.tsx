"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import { StatementSection } from "./StatementSection";
import { ThreeSidedPerspective } from "./ThreeSidedPerspective";
import { InteractiveProofVisualizer } from "./InteractiveProofVisualizer";
import { GlickoLedgerExplorer } from "./GlickoLedgerExplorer";
import { ConversionTerminal } from "./ConversionTerminal";

export function HeroAndArenas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arenasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative overflow-visible bg-background">
      {/* Section 1: Magazine Editorial Hero Section */}
      <HeroSection />

      {/* Section 2: Interactive 3-Card Docking Arenas Section */}
      <ArenasSection ref={arenasRef} containerRef={containerRef} />

      {/* Section 3: High-Impact Statement & Principles */}
      <StatementSection />

      {/* Section 4: Three-Sided Platform Storytelling (Developers · Recruiters · Hosts) */}
      <ThreeSidedPerspective />

      {/* Section 5: Interactive Proof Packet Cryptographic Anatomy Visualizer */}
      <InteractiveProofVisualizer />

      {/* Section 6: Glicko-2 Multi-Domain Mathematical Ledger */}
      <GlickoLedgerExplorer />

      {/* Section 7: Conversion Terminal & Next Steps */}
      <ConversionTerminal />
    </div>
  );
}

export default HeroAndArenas;
