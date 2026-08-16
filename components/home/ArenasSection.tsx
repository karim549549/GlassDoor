"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { HeroArenaCard } from "./Hero/HeroArenaCard";
import { ARENA_CARDS, type ArenaCardData } from "./Hero/arena-cards-data";
import type { BoardSummary } from "@/lib/arena/service";

interface ArenasSectionProps extends React.ComponentProps<"section"> {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Real arenas from the database, in the same order as the docking slots. */
  cards?: ArenaCardData[];
  /** Live counts for the board summary strip. */
  summary?: BoardSummary | null;
}

/**
 * Resting positions for the three cards once they dock. Slot index matches card
 * index: slot 0 is the card the pin timeline sends to x:-500, and so on.
 *
 * The labels beneath each slot used to be three hardcoded organizer names. They
 * now come from the docked card itself, so they describe the arena actually
 * sitting there.
 */
const DOCK_SLOTS = [
  {
    id: "left",
    desktopClass: "md:translate-x-[calc(-50%-500px)] md:translate-y-[-50%]",
    mobileClass: "translate-y-[calc(-50%-24vh)] translate-x-[-50%]",
  },
  {
    id: "middle",
    desktopClass: "md:translate-x-[-50%] md:translate-y-[-50%]",
    mobileClass: "translate-y-[-50%] translate-x-[-50%]",
  },
  {
    id: "right",
    desktopClass: "md:translate-x-[calc(-50%+500px)] md:translate-y-[-50%]",
    mobileClass: "translate-y-[calc(-50%+24vh)] translate-x-[-50%]",
  },
];

export const ArenasSection = forwardRef<HTMLDivElement, ArenasSectionProps>(
  ({ containerRef, cards, summary, ...props }, ref) => {
    const deck = (cards && cards.length > 0 ? cards : ARENA_CARDS).slice(0, 3);
    const docked = deck.length === 3 ? deck : [...deck, ...ARENA_CARDS.slice(deck.length)].slice(0, 3);

    return (
      <section
        ref={ref}
        // z-10, deliberately BELOW the directive section (z-20) that follows.
        // At the end of the docking sequence the cards keep travelling down and
        // slide behind that section rather than fading out in place, so they
        // have to lose the stacking contest with it. Was z-30, which pinned
        // them on top of everything after.
        className="arenas-section-container relative h-auto md:h-screen md:min-h-screen bg-background text-foreground flex flex-col justify-between py-12 md:py-16 px-6 md:px-12 transition-colors duration-300 overflow-visible z-10 border-b border-foreground"
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

          {/* Live board summary.
              Was three hardcoded capability tags, one of which described a
              mechanic that does not exist here - the rating is Glicko-2, not
              XP. These are counted from the same rows the board below lists, so
              the numbers cannot drift from what a visitor finds on click. */}
          <dl className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
            <div>
              <dt className="font-mono text-[0.45rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                On the board
              </dt>
              <dd className="font-mono text-[1.4rem] leading-none tabular-nums mt-1.5">
                {summary?.total ?? "--"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.45rem] font-bold uppercase tracking-[0.2em] text-orange">
                Taking entries
              </dt>
              <dd className="font-mono text-[1.4rem] leading-none tabular-nums text-orange mt-1.5">
                {summary?.openNow ?? "--"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.45rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Team / solo
              </dt>
              <dd className="font-mono text-[1.4rem] leading-none tabular-nums mt-1.5">
                {summary ? `${summary.teamCount}/${summary.soloCount}` : "--"}
              </dd>
            </div>
            {summary?.nextDeadline && (
              <div>
                <dt className="font-mono text-[0.45rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Next entry closes
                </dt>
                <dd className="font-mono text-[0.72rem] uppercase tracking-wider mt-2.5">
                  {new Date(summary.nextDeadline).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Dynamic Center landing space for fanned cards */}
        <div className="flex-1 w-full max-w-7xl mx-auto relative flex flex-col md:flex-row items-center justify-center min-h-[360px] md:overflow-visible overflow-hidden mt-6">
          
          {/* Camera Viewfinder Slots */}
          {DOCK_SLOTS.map((slot, slotIdx) => (
            <div
              key={slot.id}
              className={`hidden md:block absolute left-1/2 top-1/2 w-[calc(min(480px,88vw)+32px)] h-[322px] pointer-events-none ${slot.desktopClass} ${slot.mobileClass} md:scale-90 scale-[0.82] transition-colors duration-300 overflow-visible`}
            >
              <div className="absolute inset-0 border border-dashed border-current/5" />
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-current" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-current" />

              {/* Organizer Block (Reveals dynamically beneath the card settled spot) */}
              <div className="arena-organizer-block absolute left-4 bottom-[-54px] flex items-center gap-2.5 opacity-0 translate-y-3 pointer-events-none transition-colors duration-300">
                <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center font-mono text-[0.6rem] font-bold bg-card text-foreground">
                  {docked[slotIdx].trackInitials}
                </div>
                <div className="text-left">
                  <span className="font-mono text-[0.38rem] text-muted-foreground uppercase tracking-widest block font-bold leading-none mb-0.5">
                    [TRACK]
                  </span>
                  <span className="font-mono text-[0.52rem] font-bold uppercase tracking-wider leading-none">
                    {docked[slotIdx].trackLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mount the card stack inside this viewport-centered docking context */}
          <HeroArenaCard
            containerRef={containerRef || { current: null }}
            arenasRef={ref as React.RefObject<HTMLDivElement | null>}
            cards={docked}
          />
        </div>

        {/* Enter the Arena Action Button (Contained naturally within vertical flex flow under the cards grid) */}
        <div className="arena-enter-button w-full flex justify-center py-6 md:opacity-0 md:translate-y-4 md:pointer-events-none transition-all duration-300">
          <Link
            href="/arena"
            className="px-8 py-3.5 bg-orange text-card border border-orange font-mono text-[0.65rem] font-bold tracking-[0.25em] uppercase hover:bg-card hover:text-foreground hover:border-foreground transition-colors shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-[6px_6px_0px_0px_var(--foreground)] active:translate-y-0.5 flex items-center gap-2 pointer-events-auto"
          >
            Enter the Arena <span className="font-sans font-normal text-xs">→</span>
          </Link>
        </div>

        {/* Section Footer / Tech Ticker */}
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center border-t border-border/30 pt-6 gap-4 font-mono text-[0.52rem] uppercase tracking-[0.2em] text-muted-foreground">
          <div>
            {docked[0].href
              ? `${docked[0].timeLabel.toLowerCase()}: ${docked[0].timeValue}`
              : "No arena is currently taking entries"}
          </div>
          <div className="flex gap-4">
            {/* Both of these were href="#". They now go where they say. */}
            <Link href="/arena?status=completed" className="hover:text-orange transition-colors">
              [Browse Arena History]
            </Link>
            <Link href="/arena/create" className="hover:text-orange transition-colors">
              [Host an Arena]
            </Link>
          </div>
        </div>
      </section>
    );
  }
);

ArenasSection.displayName = "ArenasSection";
export default ArenasSection;
