"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface ArenaCardData {
  id: string;
  tag: string;
  title: string;
  description: string;
  tech: string[];
  timeLabel: string;
  timeValue: string;
  isLive: boolean;
}

const ARENA_CARDS: ArenaCardData[] = [
  // Card 3 (Bottom card in stack, index 0 in render to layer below)
  {
    id: "card-database",
    tag: "Database Speedrun",
    title: "MIGRATE 10M RECORDS LIVE",
    description: "Optimize migration scripts to sync a database with zero downtime under load.",
    tech: ["POSTGRES", "PYTHON", "PRISMA"],
    timeLabel: "STARTS IN",
    timeValue: "3 DAYS",
    isLive: false,
  },
  // Card 2 (Middle card in stack, index 1 in render to layer middle)
  {
    id: "card-devops",
    tag: "DevOps Sprint",
    title: "SCALE WEBSOCKET CLUSTER TO 10K",
    description: "Deploy and load-test a distributed messaging server with high availability.",
    tech: ["REDIS", "GO", "DOCKER"],
    timeLabel: "STARTS IN",
    timeValue: "24 HOURS",
    isLive: false,
  },
  // Card 1 (Top card in stack, index 2 in render to layer on top)
  {
    id: "card-frontend",
    tag: "Arena Challenge",
    title: "BUILD A REAL-TIME DEVELOPER MAP",
    description: "Create an interactive map tracking live developer profiles and statuses during a 6-hour sprint.",
    tech: ["REACT", "NODE.JS", "WEBSOCKETS"],
    timeLabel: "TIME REGISTRY",
    timeValue: "05:12:43", // Will update dynamically for this active card
    isLive: true,
  },
];

export function HeroArenaCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for each card element
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Countdown state for the top active card
  const [activeTimer, setActiveTimer] = useState("05:12:43");

  useEffect(() => {
    // Dynamic countdown timer loop for the active card
    let totalSeconds = 5 * 3600 + 12 * 60 + 43;
    const interval = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(interval);
        return;
      }
      totalSeconds -= 1;
      const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
      const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
      const secs = (totalSeconds % 60).toString().padStart(2, "0");
      setActiveTimer(`${hrs}:${mins}:${secs}`);
    }, 1000);

    // GSAP Magician Card Gathering Entrance Animation
    const ctx = gsap.context(() => {
      const cards = cardRefs.current;
      if (!cards) return;

      // Set initial scattered positions (Magician gathering cards)
      // Card 3 (Bottom): starts bottom-left, tilted heavily
      gsap.set(cards[0], { opacity: 0, x: -320, y: 220, rotate: -45, scale: 0.9 });
      // Card 2 (Middle): starts top-right, tilted right
      gsap.set(cards[1], { opacity: 0, x: 280, y: -240, rotate: 35, scale: 0.95 });
      // Card 1 (Top): starts top-left, tilted left
      gsap.set(cards[2], { opacity: 0, x: -250, y: -200, rotate: -30, scale: 1.1 });

      // Coordinated timeline to gather them into a neat stack
      const tl = gsap.timeline({ delay: 0.4 });
      
      // Snapping bottom card first, then middle, then top snaps into hand
      tl.to(cards[0], { opacity: 1, x: 0, y: 0, rotate: -4, scale: 1, duration: 0.75, ease: "power3.out" })
        .to(cards[1], { opacity: 1, x: 0, y: 0, rotate: 3, scale: 1, duration: 0.75, ease: "power3.out" }, "-=0.55")
        .to(cards[2], { opacity: 1, x: 0, y: 0, rotate: -1.5, scale: 1, duration: 0.85, ease: "back.out(1.2)" }, "-=0.55");

    }, containerRef);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  // Hover: Fan out cards slightly so the background cards peek out clearly
  const handleMouseEnter = () => {
    const cards = cardRefs.current;
    if (!cards) return;

    // Card 3 (Bottom) fans out left and down
    gsap.to(cards[0], {
      rotate: -7,
      x: -18,
      y: 10,
      scale: 0.99,
      boxShadow: "3px 3px 0px 0px rgba(14,14,13,0.7)",
      duration: 0.4,
      ease: "power2.out"
    });

    // Card 2 (Middle) fans out right and up
    gsap.to(cards[1], {
      rotate: 5,
      x: 18,
      y: -10,
      scale: 1.01,
      boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.8)",
      duration: 0.4,
      ease: "power2.out"
    });

    // Card 1 (Top) lifts up, centers slightly, and increases shadow
    gsap.to(cards[2], {
      rotate: -1,
      x: 0,
      y: -6,
      scale: 1.025,
      boxShadow: "8px 8px 0px 0px rgba(14,14,13,1)",
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    const cards = cardRefs.current;
    if (!cards) return;

    // Return all cards to their default stacked resting state
    gsap.to(cards[0], {
      rotate: -4,
      x: 0,
      y: 0,
      scale: 1,
      boxShadow: "2px 2px 0px 0px rgba(14,14,13,0.75)",
      duration: 0.45,
      ease: "power2.out"
    });

    gsap.to(cards[1], {
      rotate: 3,
      x: 0,
      y: 0,
      scale: 1,
      boxShadow: "3px 3px 0px 0px rgba(14,14,13,0.85)",
      duration: 0.45,
      ease: "power2.out"
    });

    gsap.to(cards[2], {
      rotate: -1.5,
      x: 0,
      y: 0,
      scale: 1,
      boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.9)",
      duration: 0.45,
      ease: "power2.out"
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute left-1/2 z-25 w-[min(540px,94%)] min-h-[310px]"
      style={{
        top: "43%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {ARENA_CARDS.map((card, idx) => {
        // Layout layers: Card 3 is index 0 (rendered first/bottom), Card 1 is index 2 (rendered last/top)
        const isTop = idx === ARENA_CARDS.length - 1;
        const zIndexClass = idx === 0 ? "z-10" : idx === 1 ? "z-20" : "z-30";
        const shadowStyle = idx === 0 
          ? "2px 2px 0px 0px rgba(14,14,13,0.75)" 
          : idx === 1 
            ? "3px 3px 0px 0px rgba(14,14,13,0.85)" 
            : "4px 4px 0px 0px rgba(14,14,13,0.9)";

        return (
          <div
            key={card.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className={`absolute inset-0 bg-[#FAF8F5] text-[#0E0E0D] border-4 border-double border-[#0E0E0D] p-7 md:p-9 cursor-pointer select-none flex flex-col justify-between ${zIndexClass}`}
            style={{
              boxShadow: shadowStyle,
            }}
          >
            {/* Outline grids */}
            <div className="absolute inset-1 border border-[#0E0E0D]/10 pointer-events-none" />
            <div className="absolute inset-1.5 border border-dashed border-[#0E0E0D]/5 pointer-events-none" />

            {/* Poster Header / Title Lockup */}
            <div className="space-y-4">
              <div className="font-display italic text-[clamp(1.4rem,3.2vw,2.3rem)] leading-[1.08] text-[#0E0E0D] tracking-tight">
                <span className="text-orange font-bold not-italic font-mono text-[0.65rem] tracking-[0.25em] border border-orange px-2 py-0.5 inline-block mr-3.5 align-middle -translate-y-0.5">
                  [{card.tag}]
                </span>
                {card.title}
              </div>
              
              <p className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-md">
                {card.description}
              </p>
            </div>

            {/* Bottom Content Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-dashed border-[#0E0E0D]/20 mt-6">
              
              {/* Bottom Left: Countdown */}
              <div className="flex flex-col">
                <span className="font-mono text-[0.45rem] uppercase tracking-[0.25em] text-muted-foreground mb-1 block font-bold">
                  [{card.timeLabel}]
                </span>
                <div className={`font-mono text-[1.25rem] font-bold leading-none tracking-widest ${card.isLive ? "text-[#0E0E0D]" : "text-muted-foreground"}`}>
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
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {card.tech.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[0.52rem] uppercase tracking-wider text-[#0E0E0D] font-bold"
                  >
                    [{tech}]
                  </span>
                ))}
              </div>
              
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default HeroArenaCard;
