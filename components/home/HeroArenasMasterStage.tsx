"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Users, Trophy } from "lucide-react";
import { HeroMasthead } from "./Hero/HeroMasthead";
import { HeroCoverNotes } from "./Hero/HeroCoverNotes";
import { HeroHeadline } from "./Hero/HeroHeadline";
import { BackgroundGrid } from "../ui/BackgroundGrid";
import { ARENA_CARDS } from "./Hero/arena-cards-data";

gsap.registerPlugin(ScrollTrigger);

const DOCK_SLOTS = [
  {
    id: "left",
    desktopClass: "md:translate-x-[calc(-50%-500px)] md:translate-y-[-50%]",
    organizer: "Coon Cluster",
    initials: "CC",
  },
  {
    id: "middle",
    desktopClass: "md:translate-x-[-50%] md:translate-y-[-50%]",
    organizer: "StackOps",
    initials: "SO",
  },
  {
    id: "right",
    desktopClass: "md:translate-x-[calc(-50%+500px)] md:translate-y-[-50%]",
    organizer: "Devs Arena",
    initials: "DA",
  },
];

const DIRECTIVE_PARTS = [
  { text: "We turn competitive code sprints into ", highlight: false },
  { text: "unforgeable hiring credentials", highlight: true },
  { text: ". Proving what developers can actually build.", highlight: false },
];

export function HeroArenasMasterStage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const arenasLayerRef = useRef<HTMLDivElement>(null);
  const directiveLayerRef = useRef<HTMLDivElement>(null);
  const directiveTextRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeTimer, setActiveTimer] = useState("05:12:43");

  // Timer countdown
  useEffect(() => {
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

    return () => clearInterval(interval);
  }, []);

  // GSAP Master Timeline
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const heroLayer = heroLayerRef.current;
    const arenasLayer = arenasLayerRef.current;
    const directiveLayer = directiveLayerRef.current;
    const directiveText = directiveTextRef.current;
    const cards = cardRefs.current;

    if (!track || !stage || !heroLayer || !arenasLayer || !directiveLayer || !directiveText || !cards[0] || !cards[1] || !cards[2]) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // 1. Initial State Setup
        gsap.set(cards[0], { opacity: 0, x: -1400, y: 1000, rotate: -75, scale: 0.8 });
        gsap.set(cards[1], { opacity: 0, x: 1400, y: -1000, rotate: 65, scale: 0.9 });
        gsap.set(cards[2], { opacity: 0, x: -1200, y: -1200, rotate: -90, scale: 1.0 });

        gsap.set(arenasLayer, { opacity: 0, pointerEvents: "none" });
        gsap.set(directiveLayer, { opacity: 0, pointerEvents: "none" });

        // 2. Entrance Animation on Page Load
        const entranceTl = gsap.timeline({ delay: 0.2 });
        const scaleBase = 1.5;

        entranceTl
          .to(cards[0], { opacity: 1, x: 0, y: "-100vh", rotate: -4, scale: scaleBase, duration: 0.9, ease: "power3.out" })
          .to(cards[1], { opacity: 1, x: 0, y: "-100vh", rotate: 3, scale: scaleBase, duration: 0.9, ease: "power3.out" }, "-=0.7")
          .to(cards[2], { opacity: 1, x: 0, y: "-100vh", rotate: -1.5, scale: scaleBase, duration: 1.0, ease: "back.out(1.1)" }, "-=0.7");

        // 3. Continuous Master Scroll Timeline
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // --- PHASE 1 (0.00 -> 0.22): Transition from Hero to Arenas ---
        masterTl
          .to(stage, { backgroundColor: "#0E0E0D", color: "#F1EFE9", ease: "none", duration: 0.22 }, 0)
          .to(heroLayer, { opacity: 0, y: -60, pointerEvents: "none", ease: "power1.inOut", duration: 0.18 }, 0)
          .to(cards[0], { y: 0, ease: "none", duration: 0.22 }, 0)
          .to(cards[1], { y: 0, ease: "none", duration: 0.22 }, 0)
          .to(cards[2], { y: 0, ease: "none", duration: 0.22 }, 0)
          .to(arenasLayer, { opacity: 1, pointerEvents: "auto", ease: "power1.inOut", duration: 0.15 }, 0.08);

        // --- PHASE 2 (0.22 -> 0.52): Arenas Horizontal Fan-out ---
        masterTl
          .to(cards[0], { x: -500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.26 }, 0.22)
          .to(cards[1], { x: 0, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.26 }, 0.22)
          .to(cards[2], { x: 500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.26 }, 0.22)
          .to(".arena-organizer-block", { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0.38)
          .to(".arena-enter-button", { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0.38);

        // --- PHASE 3 (0.52 -> 0.65): Fade Arenas Out & Transition to Directive ---
        masterTl
          .to(arenasLayer, { opacity: 0, scale: 0.95, pointerEvents: "none", duration: 0.12, ease: "power1.in" }, 0.52)
          .to(cards[0], { opacity: 0, scale: 0.75, y: 40, duration: 0.12, ease: "power1.in" }, 0.52)
          .to(cards[1], { opacity: 0, scale: 0.75, y: 40, duration: 0.12, ease: "power1.in" }, 0.52)
          .to(cards[2], { opacity: 0, scale: 0.75, y: 40, duration: 0.12, ease: "power1.in" }, 0.52)
          .to(directiveLayer, { opacity: 1, pointerEvents: "auto", duration: 0.12, ease: "power1.out" }, 0.55);

        // --- PHASE 4 (0.65 -> 1.00): Kinetic Character-by-Character Scrub Reveal ---
        const chars = directiveText.querySelectorAll(".scrub-char");
        masterTl.fromTo(
          chars,
          { opacity: 0.12, y: 6 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.008,
            ease: "none",
            duration: 0.35,
          },
          0.65
        );
      });
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={trackRef} className="hero-arenas-master-track relative w-full h-[100vh] md:h-[380vh] bg-background">
      {/* Sticky Fullscreen Master Viewport */}
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none bg-background text-foreground border-b border-foreground/20 transition-colors duration-200"
      >
        {/* Background Grid Pattern */}
        <BackgroundGrid />

        {/* ========================================================================= */}
        {/* SCENE 1: MAGAZINE EDITORIAL HERO LAYER */}
        {/* ========================================================================= */}
        <div
          ref={heroLayerRef}
          className="hero-layer absolute inset-0 z-20 pointer-events-auto flex flex-col justify-between"
        >
          {/* Slicing Horizontal Line */}
          <div
            className="absolute left-0 right-0 h-px bg-border z-30 pointer-events-none"
            style={{ top: "clamp(126px, 23.5%, 205px)" }}
          />

          <HeroMasthead />
          <HeroCoverNotes />
          <HeroHeadline />
        </div>

        {/* ========================================================================= */}
        {/* SCENE 2: ARENAS STAGE LAYER */}
        {/* ========================================================================= */}
        <div
          ref={arenasLayerRef}
          className="arenas-layer absolute inset-0 z-20 flex flex-col justify-between py-10 md:py-14 px-6 md:px-12 pointer-events-none"
        >
          {/* Header */}
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="text-left space-y-2">
              <span className="font-mono text-[0.52rem] uppercase tracking-[0.25em] text-orange font-bold block">
                [02 / STAGE ARENA]
              </span>
              <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-none uppercase font-normal text-current">
                Devs Arenas
              </h2>
              <p className="font-mono text-[0.58rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-md">
                Time-boxed coding sprints. Join open seats, collaborate with peers, and scale the rankings.
              </p>
            </div>

            {/* Technical Specs Tags */}
            <div className="flex flex-wrap gap-3 font-mono text-[0.5rem] uppercase tracking-wider text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5 border border-current/20 px-2.5 py-1">
                <Shield className="h-3.5 w-3.5 text-orange" /> [VERIFIED GITHUB]
              </span>
              <span className="flex items-center gap-1.5 border border-current/20 px-2.5 py-1">
                <Users className="h-3.5 w-3.5" /> [OPEN SEATS IN LOBBIES]
              </span>
              <span className="flex items-center gap-1.5 border border-current/20 px-2.5 py-1">
                <Trophy className="h-3.5 w-3.5" /> [XP RANKINGS SYSTEM]
              </span>
            </div>
          </div>

          {/* Docking Viewfinder Frames */}
          <div className="flex-1 w-full max-w-7xl mx-auto relative flex items-center justify-center pointer-events-none">
            {DOCK_SLOTS.map((slot) => (
              <div
                key={slot.id}
                className={`hidden md:block absolute left-1/2 top-1/2 w-[calc(min(480px,88vw)+32px)] h-[322px] pointer-events-none ${slot.desktopClass} md:scale-90 scale-[0.82] overflow-visible`}
              >
                <div className="absolute inset-0 border border-dashed border-current/15" />
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-current" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-current" />

                {/* Organizer Info Block */}
                <div className="arena-organizer-block absolute left-4 bottom-[-54px] flex items-center gap-2.5 opacity-0 translate-y-3 pointer-events-none transition-all duration-300">
                  <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center font-mono text-[0.6rem] font-bold bg-card text-foreground">
                    {slot.initials}
                  </div>
                  <div className="text-left">
                    <span className="font-mono text-[0.38rem] text-muted-foreground uppercase tracking-widest block font-bold leading-none mb-0.5">
                      [ORGANIZER]
                    </span>
                    <span className="font-mono text-[0.52rem] font-bold uppercase tracking-wider leading-none text-current">
                      {slot.organizer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="arena-enter-button w-full flex justify-center py-4 opacity-0 translate-y-4 pointer-events-auto">
            <Link
              href="/arena"
              className="px-8 py-3.5 bg-orange text-card border border-orange font-mono text-[0.65rem] font-bold tracking-[0.25em] uppercase hover:bg-card hover:text-foreground hover:border-foreground transition-all shadow-[4px_4px_0px_0px_currentColor] hover:shadow-[6px_6px_0px_0px_currentColor] active:translate-y-0.5 flex items-center gap-2"
            >
              Enter the Arena <span className="font-sans font-normal text-xs">→</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCENE 3: DIRECTIVE STATEMENT LAYER */}
        {/* ========================================================================= */}
        <div
          ref={directiveLayerRef}
          className="directive-layer absolute inset-0 z-20 flex flex-col justify-center items-center py-20 px-6 md:px-12 text-center pointer-events-none"
        >
          <div className="max-w-5xl mx-auto space-y-10 flex flex-col items-center pointer-events-auto">
            {/* Protocol Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/15 bg-white/5 font-mono text-[0.58rem] tracking-[0.25em] uppercase text-orange font-bold">
              <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
              <span>DEVS ARENA CORE DIRECTIVE // CAIRO PROTOCOL // 30.0444° N</span>
            </div>

            {/* Kinetic Letter-by-Letter Headline */}
            <h2
              ref={directiveTextRef}
              className="font-display italic text-[clamp(2.2rem,5.5vw,4.8rem)] font-normal uppercase tracking-tight leading-[1.08] text-[#F1EFE9] text-balance"
            >
              {DIRECTIVE_PARTS.map((part, pIdx) => (
                <span
                  key={pIdx}
                  className={
                    part.highlight
                      ? "text-orange underline decoration-orange/40 underline-offset-8 inline"
                      : "text-[#F1EFE9] inline"
                  }
                >
                  {part.text.split("").map((char, cIdx) => (
                    <span
                      key={cIdx}
                      className="scrub-char inline-block opacity-[0.12] will-change-[opacity,transform]"
                      style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </h2>

            {/* Sub-telemetry readout */}
            <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[0.55rem] text-[#F1EFE9]/60 uppercase tracking-[0.2em] pt-4 border-t border-white/10">
              <span>&gt; AUTOMATED CODE RUNNER VERIFICATION</span>
              <span>&bull;</span>
              <span>&gt; GLICKO-2 DOMAIN LEDGER</span>
              <span>&bull;</span>
              <span>&gt; SHA-256 PROOF PACKETS</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FLOATING 3-CARD CHOREOGRAPHY LAYER */}
        {/* ========================================================================= */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-25 w-[min(480px,88vw)] min-h-[290px] pointer-events-none overflow-visible hidden md:block">
          {ARENA_CARDS.map((card, idx) => {
            const zIndexClass = idx === 0 ? "z-10" : idx === 1 ? "z-20" : "z-30";
            const shadowStyle =
              idx === 0
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
                className={`absolute inset-0 w-full bg-card text-foreground border-4 border-double border-foreground p-7 flex flex-col justify-between pointer-events-auto ${zIndexClass}`}
                style={{ boxShadow: shadowStyle }}
              >
                {/* Outline grids */}
                <div className="absolute inset-1 border border-foreground/15 pointer-events-none" />
                <div className="absolute inset-1.5 border border-dashed border-foreground/10 pointer-events-none" />

                {/* Card Header */}
                <div className="space-y-3.5 text-left">
                  <div className="font-display italic text-[clamp(1.15rem,2.8vw,1.85rem)] leading-[1.1] text-foreground tracking-tight">
                    <span className="text-orange font-bold not-italic font-mono text-[0.6rem] tracking-[0.2em] border border-orange px-1.5 py-0.5 inline-block mr-2.5 align-middle -translate-y-0.5">
                      [{card.tag}]
                    </span>
                    {card.title}
                  </div>
                  <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-sm">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-row items-end justify-between gap-4 pt-4 border-t border-dashed border-foreground/20 mt-4 text-left">
                  <div className="flex flex-col">
                    <span className="font-mono text-[0.42rem] uppercase tracking-[0.25em] text-muted-foreground mb-1 block font-bold">
                      [{card.timeLabel}]
                    </span>
                    <div className="font-mono text-[1.1rem] font-bold leading-none tracking-widest text-foreground">
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

                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {card.tech.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[0.48rem] uppercase tracking-wider text-foreground font-bold"
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
      </div>
    </div>
  );
}

export default HeroArenasMasterStage;
