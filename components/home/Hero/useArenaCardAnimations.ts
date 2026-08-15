"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface UseArenaCardAnimationsArgs {
  containerRef: React.RefObject<HTMLDivElement | null>;
  arenasRef: React.RefObject<HTMLDivElement | null>;
}

const ENTRANCE_FALLBACK_MS = 2600;

export function useArenaCardAnimations({ containerRef, arenasRef }: UseArenaCardAnimationsArgs) {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeTimer, setActiveTimer] = useState("05:12:43");
  const [entranceFinished, setEntranceFinished] = useState(false);
  const [showCarouselControls, setShowCarouselControls] = useState(false);

  const stackOrder = useRef<number[]>([0, 1, 2]);
  const isAnimating = useRef(false);

  // Live sprint timer countdown
  useEffect(() => {
    let totalSeconds = 5 * 3600 + 12 * 60 + 43;

    const format = (s: number) => {
      const hrs = Math.floor(s / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const secs = s % 60;
      return [hrs, mins, secs].map((n) => n.toString().padStart(2, "0")).join(":");
    };

    const interval = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(interval);
        return;
      }
      totalSeconds -= 1;
      setActiveTimer(format(totalSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Entrance fly-in: Fades in ONLY ONCE at the Hero section, and never fades away again
  useEffect(() => {
    const cards = cardRefs.current;
    if (!cards || cards.length === 0) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const [a, b, c] = cards;
        if (!a || !b || !c) {
          setEntranceFinished(true);
          return;
        }

        gsap.set(a, { opacity: 0, x: -1400, y: 1000, rotate: -75, scale: 0.8 });
        gsap.set(b, { opacity: 0, x: 1400, y: -1000, rotate: 65, scale: 0.9 });
        gsap.set(c, { opacity: 0, x: -1200, y: -1200, rotate: -90, scale: 1.0 });

        const tl = gsap.timeline({ delay: 0.3 });
        const scaleBase = 1.5;

        tl.to(a, { opacity: 1, x: 0, y: "-100vh", rotate: -4, scale: scaleBase, duration: 1.1, ease: "power3.out" })
          .to(b, { opacity: 1, x: 0, y: "-100vh", rotate: 3, scale: scaleBase, duration: 1.1, ease: "power3.out" }, "-=0.8")
          .to(c, { opacity: 1, x: 0, y: "-100vh", rotate: -1.5, scale: scaleBase, duration: 1.2, ease: "back.out(1.1)" }, "-=0.8")
          .eventCallback("onComplete", () => setEntranceFinished(true));
      });

      mm.add("(max-width: 767px)", () => {
        setEntranceFinished(true);
      });
    }, stackRef);

    const fallback = window.setTimeout(() => setEntranceFinished(true), ENTRANCE_FALLBACK_MS);

    return () => {
      window.clearTimeout(fallback);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!entranceFinished) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [entranceFinished]);

  // Master Scroll Choreography: Continuous, zero-fade card movement across all sections
  useEffect(() => {
    const container = containerRef.current;
    const arenas = arenasRef.current;
    if (!container || !arenas) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length < 3) return;

    const scrollCtx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // 1. Hero fades out and Arenas panel darkens
        gsap
          .timeline({
            scrollTrigger: {
              trigger: arenas,
              start: "top bottom",
              end: "top top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(".hero-section-container", { opacity: 0, ease: "none" }, 0)
          .to(
            arenas,
            {
              backgroundColor: "#0E0E0D",
              color: "#F1EFE9",
              borderColor: "rgba(241, 239, 233, 0.15)",
              ease: "none",
            },
            0
          );

        // 2. Cards ride down from Hero into Section 2
        gsap
          .timeline({
            scrollTrigger: {
              trigger: arenas,
              start: "top bottom",
              end: "top top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(cards, { y: 0, opacity: 1, ease: "none" }, 0);

        // 3. Pinned Section 2 Docking Sequence
        const dock = gsap.timeline({
          scrollTrigger: {
            trigger: arenas,
            start: "top top",
            end: "+=1600",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 2,
          },
        });

        dock
          .to(cards[0], { x: -500, scale: 0.9, rotate: 0, opacity: 1, ease: "power1.inOut", duration: 0.65 }, 0)
          .to(cards[1], { x: 0, scale: 0.9, rotate: 0, opacity: 1, ease: "power1.inOut", duration: 0.65 }, 0)
          .to(cards[2], { x: 500, scale: 0.9, rotate: 0, opacity: 1, ease: "power1.inOut", duration: 0.65 }, 0)
          .to(".arena-organizer-block", { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.65)
          .to(".arena-enter-button", { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.65)
          .to(".arena-organizer-block", { opacity: 0, duration: 0.12, ease: "power1.in" }, 0.76)
          .to(".arena-enter-button", { opacity: 0, duration: 0.12, ease: "power1.in" }, 0.76)
          // Regroup cards back into the stacked deck as they leave Section 2 (100% opacity, no fade out)
          .to(cards[2], { x: 0, rotate: -1.5, scale: 1.05, opacity: 1, duration: 0.18, ease: "power2.inOut" }, 0.78)
          .to(cards[1], { x: 0, rotate: 3, scale: 1.05, opacity: 1, duration: 0.18, ease: "power2.inOut" }, 0.82)
          .to(cards[0], { x: 0, rotate: -4, scale: 1.05, opacity: 1, duration: 0.18, ease: "power2.inOut" }, 0.86)
          // Continuous descent without fading away
          .to(
            cards,
            {
              y: () => window.innerHeight * 1.05,
              opacity: 1,
              duration: 0.22,
              ease: "power2.in",
              stagger: 0.03,
            },
            0.86
          );

        // 4. Section 5: Cards scale up to larger hero size in right-hand column dock at center of screen
        const proofSection = document.querySelector(".proof-section-container");
        if (proofSection) {
          const proofTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: proofSection,
              start: "top 60%",
              end: "center center",
              scrub: 0.8,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                setShowCarouselControls(self.isActive || self.progress >= 0.85);
              },
              onUpdate: (self) => {
                setShowCarouselControls(self.progress >= 0.75);
              },
            },
          });

          // Cards scale up significantly to command the right column
          proofTimeline
            .to(cards[0], { x: 350, rotate: -4, scale: 1.25, opacity: 1, ease: "power1.inOut" }, 0)
            .to(cards[1], { x: 360, rotate: 3, scale: 1.20, opacity: 1, ease: "power1.inOut" }, 0)
            .to(cards[2], { x: 370, rotate: -1.5, scale: 1.15, opacity: 1, ease: "power1.inOut" }, 0)
            .to(".arena-carousel-controls", { x: 350, opacity: 1, ease: "power1.inOut" }, 0);
        }
      });

      mm.add("(max-width: 767px)", () => {
        const proofSection = document.querySelector(".proof-section-container");
        if (proofSection) {
          ScrollTrigger.create({
            trigger: proofSection,
            start: "top 60%",
            end: "center center",
            scrub: true,
            onUpdate: (self) => {
              setShowCarouselControls(self.progress >= 0.6);
            },
          });
        }
      });

      ScrollTrigger.refresh();
    }, container);

    return () => scrollCtx.revert();
  }, [containerRef, arenasRef]);

  // GSAP Fling & Stack Reorder Physics: 100% opacity maintained throughout flings
  const handleCycleStack = (direction: "next" | "prev" = "next") => {
    if (isAnimating.current) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length < 3) return;

    isAnimating.current = true;
    const isDesktop = window.innerWidth >= 768;
    const baseOffsetX = isDesktop ? 350 : 0;
    const baseScale = isDesktop ? 1.25 : 1.05;
    const restingRotations = [-4, 3, -1.5];

    const topCardIdx = direction === "next"
      ? stackOrder.current[0]
      : stackOrder.current[stackOrder.current.length - 1];

    const targetCard = cards[topCardIdx];
    if (!targetCard) {
      isAnimating.current = false;
      return;
    }

    const swipeOutX = baseOffsetX + (direction === "next" ? 260 : -260);

    gsap.timeline()
      .to(targetCard, {
        x: swipeOutX,
        rotate: direction === "next" ? 18 : -18,
        scale: baseScale * 0.95,
        opacity: 1,
        duration: 0.26,
        ease: "power2.out",
        onComplete: () => {
          if (direction === "next") {
            const first = stackOrder.current.shift() ?? 0;
            stackOrder.current.push(first);
          } else {
            const last = stackOrder.current.pop() ?? 0;
            stackOrder.current.unshift(last);
          }

          stackOrder.current.forEach((cardIdx, layerIdx) => {
            const cardEl = cards[cardIdx];
            if (cardEl) {
              const newZ = 40 - layerIdx * 10;
              const newX = baseOffsetX + layerIdx * 10;
              const newY = layerIdx * 16;
              const newScale = baseScale - layerIdx * 0.05;

              gsap.set(cardEl, { zIndex: newZ, opacity: 1 });
              if (cardIdx !== topCardIdx) {
                gsap.to(cardEl, {
                  x: newX,
                  y: newY,
                  scale: newScale,
                  opacity: 1,
                  duration: 0.22,
                  ease: "power2.out",
                });
              }
            }
          });
        },
      })
      .to(targetCard, {
        x: baseOffsetX + 20,
        y: 32,
        rotate: restingRotations[topCardIdx],
        scale: baseScale - 0.1,
        opacity: 1,
        duration: 0.26,
        ease: "power2.inOut",
        onComplete: () => {
          isAnimating.current = false;
        },
      });
  };

  return {
    stackRef,
    cardRefs,
    activeTimer,
    showCarouselControls,
    handleCycleStack,
  };
}
