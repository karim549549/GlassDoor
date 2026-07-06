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

  // Track when the entrance animation finishes to safely initialize ScrollTrigger
  const [entranceFinished, setEntranceFinished] = useState(false);

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
      setActiveTimer(`${hrs}:${secs}`);
    }, 1000);

    const cards = cardRefs.current;
    if (!cards) return;

    // Lock page scroll on initial load to prevent user from scrolling during card entrance
    document.body.style.overflow = "hidden";

    // 1. GSAP Card Gathering Entrance Animation (Lands centered relative to Hero)
    const ctx = gsap.context(() => {
      // Set initial scattered positions completely OUTSIDE the screen frame/viewport
      gsap.set(cards[0], { opacity: 0, x: -1400, y: 1000, rotate: -75, scale: 0.8 });
      gsap.set(cards[1], { opacity: 0, x: 1400, y: -1000, rotate: 65, scale: 0.9 });
      gsap.set(cards[2], { opacity: 0, x: -1200, y: -1200, rotate: -90, scale: 1.0 });

      const tl = gsap.timeline({ delay: 0.4 });

      const isDesktop = window.innerWidth >= 768;
      const scaleBase = isDesktop ? 1.5 : 1.0;

      // Cards gather in the center of the Hero section (which is top: -100vh relative to ArenasSection container)
      tl.to(cards[0], { opacity: 1, x: 0, y: "-100vh", rotate: -4, scale: scaleBase, duration: 1.15, ease: "power3.out" })
        .to(cards[1], { opacity: 1, x: 0, y: "-100vh", rotate: 3, scale: scaleBase, duration: 1.15, ease: "power3.out" }, "-=0.85")
        .to(cards[2], { 
          opacity: 1, 
          x: 0, 
          y: "-100vh", 
          rotate: -1.5, 
          scale: scaleBase, 
          duration: 1.3, 
          ease: "back.out(1.1)",
          onComplete: () => {
            // Re-enable scrolling only after flight completes, then flag entranceFinished
            document.body.style.overflow = "";
            setEntranceFinished(true);
          }
        }, "-=0.85");
    }, stackRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = ""; // Ensure scroll is restored on unmount
      clearInterval(interval);
    };
  }, []);

  // 2. GSAP ScrollTrigger Animations
  useEffect(() => {
    if (!entranceFinished || !containerRef.current || !arenasRef.current) return;

    const cards = cardRefs.current;
    if (!cards) return;

    const scrollCtx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Trigger 1: Smoothly fade out Hero text and fade in ArenasSection background color
      const fadeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: arenasRef.current,
          start: "top bottom", // Starts when ArenasSection enters from bottom
          end: "top top",      // Ends when ArenasSection fills the screen
          scrub: true,
        }
      });
      fadeTimeline.to(".hero-section-container", { opacity: 0, ease: "none" }, 0);
      fadeTimeline.to(arenasRef.current, {
        backgroundColor: "#0E0E0D",
        color: "#F1EFE9",
        borderColor: "rgba(241, 239, 233, 0.15)",
        ease: "none"
      }, 0);

      // Trigger 2: Slide the cards down to stay locked in viewport during natural scroll down the Hero
      const slideTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: arenasRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
        }
      });
      // Move cards down from y: -100vh (Hero center) to y: 0 (ArenasSection center) as page scrolls
      slideTimeline.to(cards[0], { y: 0, ease: "none" }, 0);
      slideTimeline.to(cards[1], { y: 0, ease: "none" }, 0);
      slideTimeline.to(cards[2], { y: 0, ease: "none" }, 0);

      // Trigger 3: Lock/Pin scrolling exactly when ArenasSection hits the top of the viewport,
      // and separate the cards gradually while pinned. Increased end duration to +=1800 to fully lock.
      mm.add("(min-width: 768px)", () => {
        const pinTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: arenasRef.current,
            start: "top top",    // Pin exactly when top of ArenasSection hits top of screen
            end: "+=1800",       // Lock/Pin duration scroll length (longer scroll track)
            scrub: 1,
            pin: true,           // Native GSAP scroll lock
          }
        });

        // Cards separate from 0 to 0.75 relative duration
        pinTimeline.to(cards[0], { x: -500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.75 }, 0)
                   .to(cards[1], { x: 0, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.75 }, 0)
                   .to(cards[2], { x: 500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.75 }, 0);

        // Organizers and button reveal from 0.75 to 1.0 (settled phase)
        pinTimeline.to(".arena-organizer-block", { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.75)
                   .to(".arena-enter-button", { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.75);
      });

      // Mobile Pinned separation
      mm.add("(max-width: 767px)", () => {
        const pinTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: arenasRef.current,
            start: "top top",
            end: "+=1800",
            scrub: 1,
            pin: true,
          }
        });

        pinTimeline.to(cards[0], { y: "-24vh", scale: 0.82, rotate: 0, ease: "power1.inOut", duration: 0.75 }, 0)
                   .to(cards[1], { y: "0vh", scale: 0.82, rotate: 0, ease: "power1.inOut", duration: 0.75 }, 0)
                   .to(cards[2], { y: "24vh", scale: 0.82, rotate: 0, ease: "power1.inOut", duration: 0.75 }, 0);

        pinTimeline.to(".arena-organizer-block", { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.75)
                   .to(".arena-enter-button", { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.75);
      });

      // Trigger 4: Transition cards as user scrolls from ArenasSection down into the PinkSection.
      // The cards stack back up and align on the right column (desktop) or center (mobile) at y: 100vh.
      mm.add("(min-width: 768px)", () => {
        const pinkTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".pink-section-container",
            start: "top bottom", // Starts as soon as pink section enters from bottom
            end: "top top",      // Ends when pink section fills the viewport
            scrub: true,
          }
        });

        // Translate cards' y from 0 to 100vh relative to ArenasSection container to lock them vertically,
        // while simultaneously re-stacking them and sliding them to the right column (x: 420px)
        pinkTimeline.to(cards[0], { y: "100vh", x: 420, rotate: -4, scale: 0.9, ease: "power1.inOut" }, 0);
        pinkTimeline.to(cards[1], { y: "100vh", x: 420, rotate: 3, scale: 0.9, ease: "power1.inOut" }, 0);
        pinkTimeline.to(cards[2], { y: "100vh", x: 420, rotate: -1.5, scale: 0.9, ease: "power1.inOut" }, 0);
      });

      // Mobile Pink transition: stack cards back up at center (x: 0, y: 100vh)
      mm.add("(max-width: 767px)", () => {
        const pinkTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".pink-section-container",
            start: "top bottom",
            end: "top top",
            scrub: true,
          }
        });

        pinkTimeline.to(cards[0], { y: "100vh", x: 0, rotate: -4, scale: 0.82, ease: "power1.inOut" }, 0);
        pinkTimeline.to(cards[1], { y: "100vh", x: 0, rotate: 3, scale: 0.82, ease: "power1.inOut" }, 0);
        pinkTimeline.to(cards[2], { y: "100vh", x: 0, rotate: -1.5, scale: 0.82, ease: "power1.inOut" }, 0);
      });

    }, containerRef);

    return () => {
      scrollCtx.revert();
    };
  }, [entranceFinished, containerRef, arenasRef]);

  return (
    <div
      ref={stackRef}
      className="absolute left-1/2 z-25 w-[min(480px,88vw)] min-h-[290px] pointer-events-none overflow-visible"
      style={{
        top: "50%", // Placed centered relative to ArenasSection docking container
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
            className={`absolute inset-0 bg-[#FAF8F5] text-[#0E0E0D] border-4 border-double border-[#0E0E0D] p-5 md:p-7 cursor-pointer select-none flex flex-col justify-between pointer-events-auto ${zIndexClass}`}
            style={{
              boxShadow: shadowStyle,
            }}
          >
            {/* Outline grids */}
            <div className="absolute inset-1 border border-[#0E0E0D]/10 pointer-events-none" />
            <div className="absolute inset-1.5 border border-dashed border-[#0E0E0D]/5 pointer-events-none" />

            {/* Poster Header / Title Lockup */}
            <div className="space-y-3.5 text-left">
              <div className="font-display italic text-[clamp(1.15rem,2.8vw,1.85rem)] leading-[1.1] text-[#0E0E0D] tracking-tight">
                <span className="text-orange font-bold not-italic font-mono text-[0.6rem] tracking-[0.2em] border border-orange px-1.5 py-0.5 inline-block mr-2.5 align-middle -translate-y-0.5">
                  [{card.tag}]
                </span>
                {card.title}
              </div>
              
              <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-sm:max-w-xs">
                {card.description}
              </p>
            </div>

            {/* Bottom Content Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-dashed border-[#0E0E0D]/20 mt-4 text-left">
              
              {/* Bottom Left: Countdown */}
              <div className="flex flex-col">
                <span className="font-mono text-[0.42rem] uppercase tracking-[0.25em] text-muted-foreground mb-1 block font-bold">
                  [{card.timeLabel}]
                </span>
                <div className={`font-mono text-[1.1rem] font-bold leading-none tracking-widest ${card.isLive ? "text-[#0E0E0D]" : "text-muted-foreground"}`}>
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
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {card.tech.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[0.48rem] uppercase tracking-wider text-[#0E0E0D] font-bold"
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
