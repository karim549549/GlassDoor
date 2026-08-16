"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import DirectiveSection from "./DirectiveSection";
import { ThreeSidedPerspective } from "./ThreeSidedPerspective";
import { ProofVerifier } from "./ProofVerifier";
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

      {/* SECTION 4: the arena deck, closed into a cube the reader can turn. */}
      <ThreeSidedPerspective cards={cards} />

      {/* SECTION 5: verify a credential rather than be told it is verifiable.
          Replaces a 12-column split - layer picker beside an arena-card
          carousel - where the carousel had nothing to do with proof packets and
          the split was the wireframe the rest of the page avoids. */}
      <ProofVerifier />

      {/* CHAPTER 6: Glicko-2 Multi-Domain Mathematical Ledger (Cyber Dark #070a0d) */}
      <GlickoLedgerExplorer />

      {/* CHAPTER 7: Cybernetic Conversion Terminal (Obsidian #050708) */}
      <ConversionTerminal />
    </div>
  );
}

export default HeroAndArenas;
