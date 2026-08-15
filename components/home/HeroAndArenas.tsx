"use client";

import React from "react";
import { HeroArenasMasterStage } from "./HeroArenasMasterStage";
import { ThreeSidedPerspective } from "./ThreeSidedPerspective";
import { InteractiveProofVisualizer } from "./InteractiveProofVisualizer";
import { GlickoLedgerExplorer } from "./GlickoLedgerExplorer";
import { ConversionTerminal } from "./ConversionTerminal";

export function HeroAndArenas() {
  return (
    <div className="relative overflow-visible bg-background">
      {/* UNIFIED MASTER STAGE: Hero (Scene 1) -> Arenas (Scene 2) -> Directive (Scene 3) */}
      <HeroArenasMasterStage />

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
