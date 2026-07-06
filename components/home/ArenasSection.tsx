"use client";

import React, { forwardRef } from "react";
import { Shield, Users, Trophy } from "lucide-react";
import { HeroArenaCard } from "./Hero/HeroArenaCard";

interface ArenasSectionProps extends React.ComponentProps<"section"> {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

// Organizer slot data matching Card 3, Card 2, and Card 1 respectively
const DOCK_SLOTS = [
  // Card 3 resting spot (Left on Desktop, Top on Mobile)
  {
    id: "left",
    desktopClass: "md:translate-x-[calc(-50%-500px)] md:translate-y-[-50%]",
    mobileClass: "translate-y-[calc(-50%-24vh)] translate-x-[-50%]",
    organizer: "Coon Cluster",
    initials: "CC",
  },
  // Card 2 resting spot (Middle on Desktop, Middle on Mobile)
  {
    id: "middle",
    desktopClass: "md:translate-x-[-50%] md:translate-y-[-50%]",
    mobileClass: "translate-y-[-50%] translate-x-[-50%]",
    organizer: "StackOps",
    initials: "SO",
  },
  // Card 1 resting spot (Right on Desktop, Bottom on Mobile)
  {
    id: "right",
    desktopClass: "md:translate-x-[calc(-50%+500px)] md:translate-y-[-50%]",
    mobileClass: "translate-y-[calc(-50%+24vh)] translate-x-[-50%]",
    organizer: "Devs Arena",
    initials: "DA",
  },
];

export const ArenasSection = forwardRef<HTMLDivElement, ArenasSectionProps>(
  ({ containerRef, ...props }, ref) => {
    return (
      <section
        ref={ref}
        // Set z-index to z-30 (up from z-10) to force the container and its absolute children (the cards) 
        // to render on top of the subsequent pink section (z-10) during scroll translations.
        className="arenas-section-container relative min-h-screen h-screen bg-[#F1EFE9] text-[#0E0E0D] flex flex-col justify-between py-16 px-6 md:px-12 transition-colors duration-300 overflow-visible z-30 border-b border-[#0E0E0D]"
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
          
          {/* Camera Viewfinder Slots */}
          {DOCK_SLOTS.map((slot) => (
            <div
              key={slot.id}
              className={`absolute left-1/2 top-1/2 w-[calc(min(480px,88vw)+32px)] h-[322px] pointer-events-none ${slot.desktopClass} ${slot.mobileClass} md:scale-90 scale-[0.82] transition-colors duration-300 overflow-visible`}
            >
              <div className="absolute inset-0 border border-dashed border-current/5" />
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-current" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-current" />

              {/* Organizer Block (Reveals dynamically beneath the card settled spot) */}
              <div className="arena-organizer-block absolute left-4 bottom-[-54px] flex items-center gap-2.5 opacity-0 translate-y-3 pointer-events-none transition-colors duration-300">
                <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center font-mono text-[0.6rem] font-bold bg-[#FAF8F5] text-[#0E0E0D]">
                  {slot.initials}
                </div>
                <div className="text-left">
                  <span className="font-mono text-[0.38rem] text-muted-foreground uppercase tracking-widest block font-bold leading-none mb-0.5">
                    [ORGANIZER]
                  </span>
                  <span className="font-mono text-[0.52rem] font-bold uppercase tracking-wider leading-none">
                    {slot.organizer}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mount the card stack inside this viewport-centered docking context */}
          <HeroArenaCard
            containerRef={containerRef || { current: null }}
            arenasRef={ref as React.RefObject<HTMLDivElement | null>}
          />
        </div>

        {/* Enter the Arena Action Button (Contained naturally within vertical flex flow under the cards grid) */}
        <div className="arena-enter-button w-full flex justify-center py-6 opacity-0 translate-y-4 pointer-events-none transition-all duration-300">
          <a
            href="/arenas"
            className="px-8 py-3.5 bg-orange text-[#FAF8F5] border border-orange font-mono text-[0.65rem] font-bold tracking-[0.25em] uppercase hover:bg-[#FAF8F5] hover:text-[#0E0E0D] hover:border-[#0E0E0D] transition-colors shadow-[4px_4px_0px_0px_rgba(14,14,13,1)] hover:shadow-[6px_6px_0px_0px_rgba(14,14,13,1)] active:translate-y-0.5 flex items-center gap-2 pointer-events-auto"
          >
            Enter the Arena <span className="font-sans font-normal text-xs">→</span>
          </a>
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
