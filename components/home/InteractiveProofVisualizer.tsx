"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Lock, CheckCircle2, FileCode, Video, Award, ExternalLink, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import { ARENA_CARDS, type ArenaCardData } from "./Hero/arena-cards-data";

gsap.registerPlugin(ScrollTrigger);

type ProofLayer = "hash" | "rubric" | "git" | "verifier";

export function InteractiveProofVisualizer({ cards }: { cards?: ArenaCardData[] }) {
  const [activeLayer, setActiveLayer] = useState<ProofLayer>("hash");
  const [activeTimer, setActiveTimer] = useState("24:00:00");
  const [showCarouselControls, setShowCarouselControls] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stackWrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stackOrder = useRef<number[]>([0, 1, 2]); // Tracks DOM z-index layer order
  const isAnimating = useRef(false);

  const displayCards = (cards && cards.length >= 3 ? cards : ARENA_CARDS).slice(0, 3);

  // Live countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      const pad = (n: number) => n.toString().padStart(2, "0");
      setActiveTimer(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // GSAP ScrollTrigger Choreography
  useEffect(() => {
    const section = sectionRef.current;
    const cardEls = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || cardEls.length < 3) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // 1. Background transition: Starts at 'top bottom' and morphs to 'top top' (unified with Section 2)
      gsap.fromTo(
        section,
        {
          backgroundColor: "#0E0E0D",
          color: "#F1EFE9",
          borderColor: "rgba(241, 239, 233, 0.15)",
        },
        {
          backgroundColor: "#F1EFE9",
          color: "#0E0E0D",
          borderColor: "rgba(14, 14, 13, 0.15)",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 15%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      // 2. Cards Assembly Timeline: Cards glide down from the upper dark sections, regroup, and stack into the carousel dock
      mm.add("(min-width: 768px)", () => {
        const stackTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 10%",
            scrub: 0.8,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              setShowCarouselControls(self.isActive || self.progress >= 0.8);
            },
            onUpdate: (self) => {
              setShowCarouselControls(self.progress >= 0.6);
            },
          },
        });

        // Initial offscreen positions (descending from upper black sections)
        gsap.set(cardEls[0], { y: -380, x: -80, rotate: -18, scale: 0.88, opacity: 0 });
        gsap.set(cardEls[1], { y: -320, x: 60, rotate: 22, scale: 0.88, opacity: 0 });
        gsap.set(cardEls[2], { y: -260, x: -30, rotate: -12, scale: 0.88, opacity: 0 });

        // Smooth convergence into the 3-card layered brutalist stack
        stackTimeline
          .to(cardEls[0], { y: 0, x: 0, rotate: -4, scale: 1.0, opacity: 1, ease: "power2.out", duration: 0.7 }, 0)
          .to(cardEls[1], { y: 14, x: 10, rotate: 3, scale: 0.96, opacity: 0.9, ease: "power2.out", duration: 0.75 }, 0.05)
          .to(cardEls[2], { y: 28, x: 20, rotate: -1.5, scale: 0.92, opacity: 0.8, ease: "power2.out", duration: 0.8 }, 0.1);
      });

      // Mobile Assembly
      mm.add("(max-width: 767px)", () => {
        const stackTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 20%",
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setShowCarouselControls(self.progress >= 0.5);
            },
          },
        });

        gsap.set(cardEls[0], { y: -200, opacity: 0 });
        gsap.set(cardEls[1], { y: -160, opacity: 0 });
        gsap.set(cardEls[2], { y: -120, opacity: 0 });

        stackTimeline
          .to(cardEls[0], { y: 0, rotate: -3, scale: 1.0, opacity: 1, ease: "power2.out" }, 0)
          .to(cardEls[1], { y: 12, rotate: 2, scale: 0.96, opacity: 0.9, ease: "power2.out" }, 0.05)
          .to(cardEls[2], { y: 24, rotate: -1, scale: 0.92, opacity: 0.8, ease: "power2.out" }, 0.1);
      });

      // 3. Section Header & Navigation Reveal
      const revealElements = section.querySelectorAll(".proof-reveal-el");
      gsap.fromTo(
        revealElements,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // GSAP Fling & Stack Reorder Physics (Restoring the interactive carousel from 285374d)
  const handleCycleStack = (direction: "next" | "prev" = "next") => {
    if (isAnimating.current) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length < 3) return;

    isAnimating.current = true;
    const restingRotations = [-4, 3, -1.5];

    // Current top card index is last in visual stack hierarchy
    const topCardIdx = direction === "next"
      ? stackOrder.current[0] // Front card
      : stackOrder.current[stackOrder.current.length - 1]; // Bottom card

    const targetCard = cards[topCardIdx];
    if (!targetCard) {
      isAnimating.current = false;
      return;
    }

    const swipeOutX = direction === "next" ? 260 : -260;

    gsap.timeline()
      .to(targetCard, {
        x: swipeOutX,
        rotate: direction === "next" ? 18 : -18,
        scale: 0.95,
        opacity: 0.8,
        duration: 0.26,
        ease: "power2.out",
        onComplete: () => {
          // Cycle the array order
          if (direction === "next") {
            const first = stackOrder.current.shift() ?? 0;
            stackOrder.current.push(first);
          } else {
            const last = stackOrder.current.pop() ?? 0;
            stackOrder.current.unshift(last);
          }

          // Apply updated z-index and resting layer positions
          stackOrder.current.forEach((cardIdx, layerIdx) => {
            const cardEl = cards[cardIdx];
            if (cardEl) {
              const newZ = 30 - layerIdx * 10;
              const newY = layerIdx * 14;
              const newX = layerIdx * 10;
              const newScale = 1 - layerIdx * 0.04;
              const newOpacity = 1 - layerIdx * 0.15;

              gsap.set(cardEl, { zIndex: newZ });
              if (cardIdx !== topCardIdx) {
                gsap.to(cardEl, {
                  y: newY,
                  x: newX,
                  scale: newScale,
                  opacity: newOpacity,
                  duration: 0.22,
                  ease: "power2.out",
                });
              }
            }
          });
        },
      })
      // Tuck the swiped card back into the bottom of the deck
      .to(targetCard, {
        x: 20,
        y: 28,
        rotate: restingRotations[topCardIdx],
        scale: 0.92,
        opacity: 0.8,
        duration: 0.26,
        ease: "power2.inOut",
        onComplete: () => {
          isAnimating.current = false;
        },
      });
  };

  return (
    <section
      ref={sectionRef}
      className="proof-section-container relative z-20 w-full py-24 md:py-36 px-6 md:px-12 bg-[#0E0E0D] text-[#F1EFE9] border-t border-current/15 transition-colors duration-500 overflow-hidden select-none"
    >
      {/* Universal Blueprint Grid Overlay covering the whole section */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="proof-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#proof-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="proof-reveal-el text-left space-y-3 max-w-3xl pb-6 border-b border-current/15">
          <div className="inline-flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-orange font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            <span>[05 // CRYPTOGRAPHIC ANATOMY // PROOF PROTOCOL]</span>
          </div>
          <h2 className="font-display italic text-[clamp(2.2rem,4.5vw,3.8rem)] leading-none uppercase font-normal text-current">
            The Proof Packet Credential
          </h2>
          <p className="font-sans text-sm text-current/80 leading-relaxed">
            Every sprint deliverable is sealed into an immutable JSON snapshot, signed with SHA-256, and tied to the developer&apos;s public credential ledger.
          </p>
        </div>

        {/* 2-Column Main Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column (5 cols): Layer Selection Navigation */}
          <div className="proof-reveal-el lg:col-span-5 flex flex-col justify-between gap-3.5">
            <button
              onClick={() => setActiveLayer("hash")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "hash"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <Hash className={`w-4 h-4 ${activeLayer === "hash" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">01 / SHA-256 Canonical Seal</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "hash" ? "text-background/70" : "text-current/60"}`}>
                    Deterministic payload digest
                  </span>
                </div>
              </div>
              <Lock className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("rubric")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "rubric"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className={`w-4 h-4 ${activeLayer === "rubric" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">02 / Named Judge Rubric</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "rubric" ? "text-background/70" : "text-current/60"}`}>
                    Multi-criteria scored breakdown
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("git")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "git"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCode className={`w-4 h-4 ${activeLayer === "git" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">03 / GitHub &amp; Video Defense</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "git" ? "text-background/70" : "text-current/60"}`}>
                    Synced commits &amp; architecture video
                  </span>
                </div>
              </div>
              <Video className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("verifier")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "verifier"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-4 h-4 ${activeLayer === "verifier" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">04 / Public Verification Portal</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "verifier" ? "text-background/70" : "text-current/60"}`}>
                    Instant employer validation URL
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Right Column (7 cols): Reunited Arena Cards Gliding In from Top & Stacked Carousel */}
          <div
            ref={stackWrapperRef}
            className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[440px] will-change-[transform,opacity]"
          >
            {/* Stacked Cards Deck Container */}
            <div className="relative w-full max-w-[480px] h-[320px]">
              {displayCards.map((card, idx) => {
                const zIndexClass = idx === 0 ? "z-30" : idx === 1 ? "z-20" : "z-10";
                const shadowStyle = idx === 0
                  ? "4px 4px 0px 0px rgba(14,14,13,0.9)"
                  : idx === 1
                    ? "6px 6px 0px 0px rgba(14,14,13,0.85)"
                    : "8px 8px 0px 0px rgba(14,14,13,0.75)";

                return (
                  <div
                    key={card.id}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    onClick={() => handleCycleStack("next")}
                    className={`absolute inset-0 w-full bg-card text-foreground border-4 border-double border-foreground p-6 md:p-7 flex flex-col justify-between cursor-pointer select-none ${zIndexClass}`}
                    style={{
                      boxShadow: shadowStyle,
                    }}
                  >
                    {/* Outline grid overlays */}
                    <div className="absolute inset-1 border border-foreground/15 pointer-events-none" />
                    <div className="absolute inset-1.5 border border-dashed border-foreground/10 pointer-events-none" />

                    {/* Card Title & Tag Header */}
                    <div className="space-y-3 text-left">
                      <div className="font-display italic text-[clamp(1.15rem,2.5vw,1.75rem)] leading-[1.1] text-foreground tracking-tight">
                        <span className="text-orange font-bold not-italic font-mono text-[0.58rem] tracking-[0.2em] border border-orange px-1.5 py-0.5 inline-block mr-2.5 align-middle -translate-y-0.5">
                          [{card.tag}]
                        </span>
                        {card.title}
                      </div>

                      <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-sm">
                        {card.description}
                      </p>
                    </div>

                    {/* Bottom Content Row: Timer + Tech Badges */}
                    <div className="flex flex-row items-end justify-between gap-4 pt-4 border-t border-dashed border-foreground/20 text-left">
                      {/* Left: Countdown */}
                      <div className="flex flex-col">
                        <span className="font-mono text-[0.42rem] uppercase tracking-[0.25em] text-muted-foreground mb-1 block font-bold">
                          [{card.timeLabel}]
                        </span>
                        <div className={`font-mono text-sm md:text-[1.1rem] font-bold leading-none tracking-widest ${card.isLive ? "text-foreground" : "text-muted-foreground"}`}>
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

                      {/* Right: Tech Badges */}
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {card.tech.map((tech) => (
                          <span
                            key={tech}
                            className="font-mono text-[0.42rem] md:text-[0.48rem] uppercase tracking-wider text-foreground font-bold"
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

            {/* Carousel Navigation Controls */}
            <div
              className={`flex items-center gap-4 mt-10 pt-2 transition-all duration-300 ${
                showCarouselControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <button
                onClick={() => handleCycleStack("prev")}
                className="w-10 h-10 border-2 border-foreground bg-card text-foreground flex items-center justify-center font-mono font-bold text-xs hover:bg-foreground hover:text-card transition-colors shadow-[2px_2px_0px_0px_var(--foreground)] active:translate-y-0.5"
                title="Previous Arena Card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="font-mono text-[0.58rem] font-bold uppercase tracking-widest text-current/70">
                <span>CYCLE CARDS DECK</span>
              </div>

              <button
                onClick={() => handleCycleStack("next")}
                className="w-10 h-10 border-2 border-foreground bg-card text-foreground flex items-center justify-center font-mono font-bold text-xs hover:bg-foreground hover:text-card transition-colors shadow-[2px_2px_0px_0px_var(--foreground)] active:translate-y-0.5"
                title="Next Arena Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveProofVisualizer;
