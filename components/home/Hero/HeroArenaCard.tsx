"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

interface HeroArenaCardProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  arenasRef: React.RefObject<HTMLDivElement | null>;
}

export function HeroArenaCard({ containerRef, arenasRef }: HeroArenaCardProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  
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

    const cards = cardRefs.current;
    if (!cards) return;

    // 1. GSAP Card Gathering Entrance Animation (Lands at size scale: 1.5)
    const ctx = gsap.context(() => {
      // Set initial scattered positions completely OUTSIDE the screen frame/viewport
      gsap.set(cards[0], { opacity: 0, x: -1400, y: 1000, rotate: -75, scale: 0.8 });
      gsap.set(cards[1], { opacity: 0, x: 1400, y: -1000, rotate: 65, scale: 0.9 });
      gsap.set(cards[2], { opacity: 0, x: -1200, y: -1200, rotate: -90, scale: 1.0 });

      // Coordinated timeline to gather them into a neat stack
      const tl = gsap.timeline({ delay: 0.4 });
      
      tl.to(cards[0], { opacity: 1, x: 0, y: 0, rotate: -4, scale: 1.5, duration: 1.15, ease: "power3.out" })
        .to(cards[1], { opacity: 1, x: 0, y: 0, rotate: 3, scale: 1.5, duration: 1.15, ease: "power3.out" }, "-=0.85")
        .to(cards[2], { opacity: 1, x: 0, y: 0, rotate: -1.5, scale: 1.5, duration: 1.3, ease: "back.out(1.1)" }, "-=0.85");
    }, stackRef);

    // 2. GSAP ScrollTrigger Pinned Separation, Scaling, & Theme Morphing Animation
    const scrollCtx = gsap.context(() => {
      if (!containerRef.current || !arenasRef.current) return;

      const mm = gsap.matchMedia();

      // Desktop: Pin layout, slide sections, separate cards horizontally, reset scale (1.5 -> 1.0)
      mm.add("(min-width: 768px)", () => {
        const scrollTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=1600", // Pinned scroll track length
            scrub: 1,      // Smooth momentum follow
            pin: true,     // Lock scroll during animation phases
          }
        });

        // Phase 1 (First 50% of scroll timeline): Slide sections up & morph background
        scrollTimeline.to(".hero-section-container", { y: "-100vh", duration: 1, ease: "none" }, 0);
        scrollTimeline.to(".arenas-section-container", { y: "-100vh", duration: 1, ease: "none" }, 0);
        scrollTimeline.to(arenasRef.current, {
          backgroundColor: "#0E0E0D",
          color: "#F1EFE9",
          borderColor: "rgba(241, 239, 233, 0.15)",
          duration: 1,
          ease: "none"
        }, 0);

        // Phase 2 (Last 50% of scroll timeline): Separate cards horizontally & scale down to 1.0
        scrollTimeline.to(cards[0], { x: -380, scale: 1, rotate: 0, duration: 1, ease: "power2.out" }, 1);
        scrollTimeline.to(cards[1], { x: 0, scale: 1, rotate: 0, duration: 1, ease: "power2.out" }, 1);
        scrollTimeline.to(cards[2], { x: 380, scale: 1, rotate: 0, duration: 1, ease: "power2.out" }, 1);
      });

      // Mobile: Pin layout, vertical stack separation
      mm.add("(max-width: 767px)", () => {
        const scrollTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=1600",
            scrub: 1,
            pin: true,
          }
        });

        // Phase 1: Slide sections up & morph background
        scrollTimeline.to(".hero-section-container", { y: "-100vh", duration: 1, ease: "none" }, 0);
        scrollTimeline.to(".arenas-section-container", { y: "-100vh", duration: 1, ease: "none" }, 0);
        scrollTimeline.to(arenasRef.current, {
          backgroundColor: "#0E0E0D",
          color: "#F1EFE9",
          borderColor: "rgba(241, 239, 233, 0.15)",
          duration: 1,
          ease: "none"
        }, 0);

        // Phase 2: Separate vertically and scale down to 1.0
        scrollTimeline.to(cards[0], { y: "-30vh", x: 0, rotate: 0, scale: 1, duration: 1, ease: "power2.out" }, 1);
        scrollTimeline.to(cards[1], { y: "0vh", x: 0, rotate: 0, scale: 1, duration: 1, ease: "power2.out" }, 1);
        scrollTimeline.to(cards[2], { y: "30vh", x: 0, rotate: 0, scale: 1, duration: 1, ease: "power2.out" }, 1);
      });

    }, containerRef);

    return () => {
      ctx.revert();
      scrollCtx.revert();
      clearInterval(interval);
    };
  }, [containerRef, arenasRef]);

  // Hover animations: logic changes dynamically depending on whether scroll is active (pinned/docked)
  const handleMouseEnterCard = (idx: number) => {
    const cards = cardRefs.current;
    if (!cards) return;

    if (window.scrollY < 100) {
      // Stack Hover: Fan out whole deck (at size scale: 1.5)
      gsap.to(cards[0], { rotate: -7, x: -28, y: 15, scale: 1.5 * 0.99, boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.7)", duration: 0.4, ease: "power2.out" });
      gsap.to(cards[1], { rotate: 5, x: 28, y: -15, scale: 1.5 * 1.01, boxShadow: "5px 5px 0px 0px rgba(14,14,13,0.8)", duration: 0.4, ease: "power2.out" });
      gsap.to(cards[2], { rotate: -1, x: 0, y: -8, scale: 1.5 * 1.025, boxShadow: "10px 10px 0px 0px rgba(14,14,13,1)", duration: 0.4, ease: "power2.out" });
    } else {
      // Docked Hover: Lift individual card (at normal scale: 1.0)
      const targetY = window.innerWidth >= 768 ? "-6px" : idx === 0 ? "-32vh" : idx === 1 ? "-2vh" : "28vh";
      gsap.to(cards[idx], {
        y: targetY,
        scale: 1.02,
        boxShadow: "8px 8px 0px 0px rgba(14,14,13,1)",
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeaveCard = (idx: number) => {
    const cards = cardRefs.current;
    if (!cards) return;

    if (window.scrollY < 100) {
      // Stack MouseLeave: Reset back to tight stack (at size scale: 1.5)
      gsap.to(cards[0], { rotate: -4, x: 0, y: 0, scale: 1.5, boxShadow: "2px 2px 0px 0px rgba(14,14,13,0.75)", duration: 0.45, ease: "power2.out" });
      gsap.to(cards[1], { rotate: 3, x: 0, y: 0, scale: 1.5, boxShadow: "3px 3px 0px 0px rgba(14,14,13,0.85)", duration: 0.45, ease: "power2.out" });
      gsap.to(cards[2], { rotate: -1.5, x: 0, y: 0, scale: 1.5, boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.9)", duration: 0.45, ease: "power2.out" });
    } else {
      // Docked MouseLeave: Reset individual card to resting scroll position (at normal scale: 1.0)
      const targetY = window.innerWidth >= 768 ? "0px" : idx === 0 ? "-30vh" : idx === 1 ? "0vh" : "30vh";
      gsap.to(cards[idx], {
        y: targetY,
        scale: 1,
        boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.9)",
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  return (
    <div
      ref={stackRef}
      className="absolute left-1/2 z-25 w-[min(540px,94%)] min-h-[310px] pointer-events-none"
      style={{
        top: "calc(50vh - 44px)", // Starts exactly in the vertical center of the Hero screen
        transform: "translate(-50%, -50%)",
      }}
    >
      {ARENA_CARDS.map((card, idx) => {
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
            onMouseEnter={() => handleMouseEnterCard(idx)}
            onMouseLeave={() => handleMouseLeaveCard(idx)}
            className={`absolute inset-0 bg-[#FAF8F5] text-[#0E0E0D] border-4 border-double border-[#0E0E0D] p-7 md:p-9 cursor-pointer select-none flex flex-col justify-between pointer-events-auto ${zIndexClass}`}
            style={{
              boxShadow: shadowStyle,
            }}
          >
            {/* Outline grids */}
            <div className="absolute inset-1 border border-[#0E0E0D]/10 pointer-events-none" />
            <div className="absolute inset-1.5 border border-dashed border-[#0E0E0D]/5 pointer-events-none" />

            {/* Poster Header / Title Lockup */}
            <div className="space-y-4 text-left">
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-dashed border-[#0E0E0D]/20 mt-6 text-left">
              
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
