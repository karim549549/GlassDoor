"use client";

import React, { forwardRef } from "react";
import { Shield, Users, Trophy } from "lucide-react";
import { HeroArenaCard } from "./Hero/HeroArenaCard";

interface ArenasSectionProps extends React.ComponentProps<"section"> {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ArenasSection = forwardRef<HTMLDivElement, ArenasSectionProps>(
  ({ containerRef, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className="arenas-section-container relative min-h-screen h-screen bg-[#F1EFE9] text-[#0E0E0D] flex flex-col justify-between py-16 px-6 md:px-12 transition-colors duration-300 overflow-visible z-10 border-b border-[#0E0E0D]"
        {...props}
      >
        {/* Technical Section Header */}
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="text-left space-y-2">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.25em] text-orange font-bold block">
              [02 / STAGE ARENA]
            </span>
            <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-none uppercase font-normal">
              Devs Arenas
            </h2>
            <p className="font-mono text-[0.58rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-md">
              Time-boxed coding sprints. Join open seats, collaborate with peers, and scale the rankings.
            </p>
          </div>

          {/* Technical Specs Tags list */}
          <div className="flex flex-wrap gap-3 font-mono text-[0.5rem] uppercase tracking-wider text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5 border border-border/40 px-2.5 py-1">
              <Shield className="h-3.5 w-3.5 text-orange" /> [VERIFIED GITHUB]
            </span>
            <span className="flex items-center gap-1.5 border border-border/40 px-2.5 py-1">
              <Users className="h-3.5 w-3.5" /> [OPEN SEATS IN LOBBIES]
            </span>
            <span className="flex items-center gap-1.5 border border-border/40 px-2.5 py-1">
              <Trophy className="h-3.5 w-3.5" /> [XP RANKINGS SYSTEM]
            </span>
          </div>
        </div>

        {/* Dynamic Center landing space for fanned cards */}
        <div className="flex-1 w-full max-w-7xl mx-auto relative flex items-center justify-center min-h-[360px] overflow-visible">
          {/* Fanned cards from hero will dock dynamically here via GSAP scroll trigger */}
          <div className="absolute inset-0 border border-dashed border-[#0E0E0D]/10 pointer-events-none flex items-center justify-center">
            <span className="font-mono text-[0.45rem] uppercase tracking-[0.3em] text-muted-foreground/30 font-bold select-none">
              [Lobby Docking Area]
            </span>
          </div>

          {/* Mount the card stack inside this viewport-centered docking context */}
          <HeroArenaCard
            containerRef={containerRef || { current: null }}
            arenasRef={ref as React.RefObject<HTMLDivElement | null>}
          />
        </div>

        {/* Section Footer / Tech Ticker */}
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center border-t border-border/30 pt-6 gap-4 font-mono text-[0.52rem] uppercase tracking-[0.2em] text-muted-foreground">
          <div>Next active sprint begins in 5 hours</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange transition-colors">[Browse Arena History]</a>
            <a href="#" className="hover:text-orange transition-colors">[Arena Rules]</a>
          </div>
        </div>
      </section>
    );
  }
);

ArenasSection.displayName = "ArenasSection";
export default ArenasSection;
