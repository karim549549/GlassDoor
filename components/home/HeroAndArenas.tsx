"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import DirectiveSection from "./DirectiveSection";
import { ThreeSidedPerspective } from "./ThreeSidedPerspective";
import { ForCompanies } from "./ForCompanies";
import { GlickoLedgerExplorer } from "./GlickoLedgerExplorer";
import type { ArenaCardData } from "./Hero/arena-cards-data";
import type { BoardSummary } from "@/lib/arena/service";
import type { GlobalStanding } from "@/lib/arena/leaderboard-service";

export function HeroAndArenas({
  cards,
  openCount = 0,
  summary,
  standings = [],
}: {
  cards?: ArenaCardData[];
  openCount?: number;
  summary?: BoardSummary | null;
  standings?: GlobalStanding[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const arenasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative overflow-visible bg-background">
      {/* SECTION 1: Magazine Editorial Hero Section */}
      <HeroSection openCount={openCount} />

      {/* SECTION 2: Pinned 3-Card Docking Arenas Section (Dark Mode #0E0E0D) */}
      <ArenasSection ref={arenasRef} containerRef={containerRef} cards={cards} summary={summary} standings={standings} />

      {/* SECTION 3: Pinned Directive Statement with Character-by-Character Scrub (Dark Mode #0E0E0D) */}
      <DirectiveSection />

      {/* SECTION 4: what a developer actually wins by entering an arena, and the
          lifecycle they go through to get it. Same cube, different job - the
          page had already shown arena cards three times by this point. */}
      <ThreeSidedPerspective />

      {/* SECTION 5: the hiring side - the first thing on the page addressed to
          the people who pay. Replaced a SHA-256 verifier which was correct,
          real, and a documentation page rather than a sales one. */}
      <ForCompanies />

      {/* SECTION 6: Glicko-2 Multi-Domain Mathematical Ledger (Cyber Dark #070a0d) */}
      <GlickoLedgerExplorer />
    </div>
  );
}

export default HeroAndArenas;
