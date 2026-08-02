"use client";

import React from "react";
import { ARENA_CARDS } from "./arena-cards-data";
import { useArenaCardAnimations } from "./useArenaCardAnimations";

interface HeroArenaCardProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  arenasRef: React.RefObject<HTMLDivElement | null>;
}

export function HeroArenaCard({ containerRef, arenasRef }: HeroArenaCardProps) {
  const { stackRef, cardRefs, activeTimer, showCarouselControls, handleCycleStack } =
    useArenaCardAnimations({ containerRef, arenasRef });

  return (
    <div
      ref={stackRef}
      className="relative w-full flex flex-col gap-6 px-4 md:px-0 py-6 max-w-[480px] mx-auto md:absolute md:left-1/2 md:z-25 md:w-[min(480px,88vw)] md:min-h-[290px] md:pointer-events-none md:overflow-visible md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
    >
      {ARENA_CARDS.map((card, idx) => {
        const zIndexClass = idx === 0 ? "z-10" : idx === 1 ? "z-20" : "z-30";
        const shadowStyle = idx === 0
          ? "2px 2px 0px 0px rgba(14,14,13,0.75)"
          : idx === 1
            ? "3px 3px 0px 0px rgba(14,14,13,0.85)"
            : "4px 4px 0px 0px rgba(14,14,13,0.9)";

        // Match organizers based on idx
        const initials = idx === 0 ? "CC" : idx === 1 ? "SO" : "DA";
        const organizer = idx === 0 ? "Coon Cluster" : idx === 1 ? "StackOps" : "Devs Arena";

        return (
          <div
            key={card.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className={`md:absolute md:inset-0 relative w-full bg-[#FAF8F5] text-[#0E0E0D] border-4 border-double border-[#0E0E0D] p-5 md:p-7 md:cursor-pointer md:select-none flex flex-col justify-between md:pointer-events-auto ${zIndexClass}`}
            style={{
              boxShadow: shadowStyle,
            }}
          >
            {/* Outline grids */}
            <div className="absolute inset-1 border border-[#0E0E0D]/15 pointer-events-none" />
            <div className="absolute inset-1.5 border border-dashed border-[#0E0E0D]/10 pointer-events-none" />

            {/* Card Header / Title Lockup */}
            <div className="space-y-3.5 text-left">
              <div className="font-display italic text-[clamp(1.15rem,2.8vw,1.85rem)] leading-[1.1] text-[#0E0E0D] tracking-tight">
                <span className="text-orange font-bold not-italic font-mono text-[0.6rem] tracking-[0.2em] border border-orange px-1.5 py-0.5 inline-block mr-2.5 align-middle -translate-y-0.5">
                  [{card.tag}]
                </span>
                {card.title}
              </div>

              <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-sm">
                {card.description}
              </p>
            </div>

            {/* Organizer Badge (Mobile Only, hidden on desktop since the viewfinder shows it) */}
            <div className="flex md:hidden items-center gap-2 mt-4 pt-3 border-t border-dashed border-[#0E0E0D]/15">
              <div className="w-6 h-6 rounded-full border border-[#0E0E0D] flex items-center justify-center font-mono text-[0.5rem] font-bold bg-[#FAF8F5] text-[#0E0E0D]">
                {initials}
              </div>
              <div className="text-left">
                <span className="font-mono text-[0.35rem] text-muted-foreground uppercase tracking-widest block font-bold leading-none mb-0.5">
                  [ORGANIZER]
                </span>
                <span className="font-mono text-[0.45rem] font-bold uppercase tracking-wider leading-none">
                  {organizer}
                </span>
              </div>
            </div>

            {/* Bottom Content Row */}
            <div className="flex flex-row items-end justify-between gap-4 pt-3 md:pt-4 border-t border-dashed border-[#0E0E0D]/20 mt-3 md:mt-4 text-left">

              {/* Bottom Left: Countdown */}
              <div className="flex flex-col">
                <span className="font-mono text-[0.42rem] uppercase tracking-[0.25em] text-muted-foreground mb-1 block font-bold">
                  [{card.timeLabel}]
                </span>
                <div className={`font-mono text-sm md:text-[1.1rem] font-bold leading-none tracking-widest ${card.isLive ? "text-[#0E0E0D]" : "text-muted-foreground"}`}>
                  {card.isLive ? (
                    <>
                      {activeTimer.split(":")[0]}
                      <span className="text-orange animate-pulse">:</span>
                      {activeTimer.split(":")[1]}
                      <span className="text-orange animate-pulse">:</span>
                      <span className="text-orange">{activeTimer.split(":")[2]}</span>
                    </>
                  ) : (
                    card.timeValue
                  )}
                </div>
              </div>

              {/* Bottom Right: Tech Badges */}
              <div className="flex flex-wrap gap-1.5 justify-end">
                {card.tech.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[0.42rem] md:text-[0.48rem] uppercase tracking-wider text-[#0E0E0D] font-bold"
                  >
                    [{tech}]
                  </span>
                ))}
              </div>

            </div>
          </div>
        );
      })}

      {/* Carousel Stack Control Arrows */}
      <div
        className={`arena-carousel-controls hidden md:flex absolute left-0 right-0 top-[260px] md:top-[280px] z-40 justify-center items-center gap-3 pointer-events-auto transition-all duration-300 ${
          showCarouselControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <button
          onClick={() => handleCycleStack("prev")}
          className="w-10 h-10 border-2 border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] flex items-center justify-center font-mono font-bold text-xs hover:bg-[#0E0E0D] hover:text-[#FAF8F5] transition-colors shadow-[2px_2px_0px_0px_rgba(14,14,13,1)] active:translate-y-0.5 pointer-events-auto"
          title="Previous Poster"
        >
          [←]
        </button>
        <button
          onClick={() => handleCycleStack("next")}
          className="w-10 h-10 border-2 border-[#0E0E0D] bg-[#FAF8F5] text-[#0E0E0D] flex items-center justify-center font-mono font-bold text-xs hover:bg-[#0E0E0D] hover:text-[#FAF8F5] transition-colors shadow-[2px_2px_0px_0px_rgba(14,14,13,1)] active:translate-y-0.5 pointer-events-auto"
          title="Next Poster"
        >
          [→]
        </button>
      </div>
    </div>
  );
}

export default HeroArenaCard;
