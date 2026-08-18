"use client";

import React, { useRef } from "react";
import HeroSection from "./Hero/HeroSection";
import ArenasSection from "./ArenasSection";
import DirectiveSection from "./DirectiveSection";
import { ThreeSidedPerspective } from "./ThreeSidedPerspective";
import { ASaturday } from "./ASaturday";
import { ConversionTerminal } from "./ConversionTerminal";

/**
 * These four below-fold sections were tried as `next/dynamic` imports and the
 * split was reverted, because it was measured and it did nothing: 1023 -> 1015
 * KB raw, 318 -> 319 KB gzipped, across 19 chunks instead of 14.
 *
 * That is the expected result rather than a mistake in the attempt. A dynamic
 * import with `ssr: true` still needs every chunk present to hydrate the markup
 * it server-rendered, so Next references them all from the initial HTML and
 * nothing is deferred - it only redraws the chunk boundaries.
 *
 * `ssr: false` *would* cut the initial JS, and is the wrong trade here: these
 * sections carry most of the page's ~1,350 words, and removing them from the
 * served HTML would buy a performance point with the SEO score and with the
 * content being indexable at all.
 *
 * The real main-thread cost is every section building its GSAP timelines on
 * mount. Reducing that means lazily creating `gsap.context()` as each section
 * approaches the viewport, not code-splitting.
 */
import type { ArenaCardData } from "./Hero/arena-cards-data";
import type { BoardSummary } from "@/lib/arena/service";

export function HeroAndArenas({
  cards,
  openCount = 0,
  summary,
}: {
  cards?: ArenaCardData[];
  openCount?: number;
  summary?: BoardSummary | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const arenasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative overflow-visible bg-background">
      {/* SECTION 1: Magazine Editorial Hero Section */}
      <HeroSection openCount={openCount} />

      {/* SECTION 2: Pinned 3-Card Docking Arenas Section (Dark Mode #0E0E0D) */}
      <ArenasSection ref={arenasRef} containerRef={containerRef} cards={cards} summary={summary} />

      {/* SECTION 3: Pinned Directive Statement with Character-by-Character Scrub (Dark Mode #0E0E0D) */}
      <DirectiveSection />

      {/* SECTION 4: what a developer actually wins by entering an arena, and the
          lifecycle they go through to get it. Same cube, different job - the
          page had already shown arena cards three times by this point. */}
      <ThreeSidedPerspective />

      {/* SECTION 5: what actually happens if you enter one. Replaced a hiring
          pitch aimed at recruiters, which now lives on /companies where its
          audience is - see PRD 1.2. */}
      <ASaturday />

      {/* SECTION 6: the ask. Ready-to-join card. The global standings rail that
          beside it - the only place on the page that reports on people rather
          than arenas, and the right place for it: last, next to the CTA. */}
      <ConversionTerminal />
    </div>
  );
}

export default HeroAndArenas;
