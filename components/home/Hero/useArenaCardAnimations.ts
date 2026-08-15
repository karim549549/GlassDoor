"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface UseArenaCardAnimationsArgs {
  containerRef: React.RefObject<HTMLDivElement | null>;
  arenasRef: React.RefObject<HTMLDivElement | null>;
}

export function useArenaCardAnimations({ containerRef, arenasRef }: UseArenaCardAnimationsArgs) {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeTimer, setActiveTimer] = useState("05:12:43");
  const [entranceFinished, setEntranceFinished] = useState(false);

  // Live sprint timer countdown
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

  // Entrance intro animation on load
  useEffect(() => {
    const cards = cardRefs.current;
    if (!cards || cards.length === 0) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop layout entrance animation
      mm.add("(min-width: 768px)", () => {
        document.body.style.overflow = "hidden";

        // Initial off-screen positions for scattered fly-in
        gsap.set(cards[0], { opacity: 0, x: -1400, y: 1000, rotate: -75, scale: 0.8 });
        gsap.set(cards[1], { opacity: 0, x: 1400, y: -1000, rotate: 65, scale: 0.9 });
        gsap.set(cards[2], { opacity: 0, x: -1200, y: -1200, rotate: -90, scale: 1.0 });

        const tl = gsap.timeline({ delay: 0.3 });
        const scaleBase = 1.5;

        // Fly cards into Hero center
        tl.to(cards[0], { opacity: 1, x: 0, y: "-100vh", rotate: -4, scale: scaleBase, duration: 1.1, ease: "power3.out" })
          .to(cards[1], { opacity: 1, x: 0, y: "-100vh", rotate: 3, scale: scaleBase, duration: 1.1, ease: "power3.out" }, "-=0.8")
          .to(cards[2], {
            opacity: 1,
            x: 0,
            y: "-100vh",
            rotate: -1.5,
            scale: scaleBase,
            duration: 1.2,
            ease: "back.out(1.1)",
            onComplete: () => {
              document.body.style.overflow = "";
              setEntranceFinished(true);
            }
          }, "-=0.8");
      });

      mm.add("(max-width: 767px)", () => {
        setEntranceFinished(true);
      });
    }, stackRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  // GSAP ScrollTrigger Animations for ArenasSection
  useEffect(() => {
    if (!entranceFinished || !containerRef.current || !arenasRef.current) return;

    const cards = cardRefs.current;
    if (!cards) return;

    const scrollCtx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Trigger 1: Fade out Hero text and morph background to dark #0E0E0D
        const fadeTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: arenasRef.current,
            start: "top bottom",
            end: "top top",
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

        // Trigger 2: Slide cards down to center as page scrolls down Hero
        const slideTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: arenasRef.current,
            start: "top bottom",
            end: "top top",
            scrub: true,
          }
        });
        slideTimeline.to(cards[0], { y: 0, ease: "none" }, 0);
        slideTimeline.to(cards[1], { y: 0, ease: "none" }, 0);
        slideTimeline.to(cards[2], { y: 0, ease: "none" }, 0);

        // Trigger 3: Lock/Pin scrolling when ArenasSection hits the top
        const pinTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: arenasRef.current,
            start: "top top",
            end: "+=1600",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
          }
        });

        // 1. Cards separate horizontally (0.0 to 0.65)
        pinTimeline.to(cards[0], { x: -500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.65 }, 0)
                   .to(cards[1], { x: 0, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.65 }, 0)
                   .to(cards[2], { x: 500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.65 }, 0);

        // 2. Organizers and button reveal (0.65 to 0.85)
        pinTimeline.to(".arena-organizer-block", { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.65)
                   .to(".arena-enter-button", { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.65);

        // 3. Smoothly fade out cards, organizers, and buttons at end of pin phase (0.85 to 1.0)
        pinTimeline.to(cards[0], { opacity: 0, scale: 0.75, y: 30, duration: 0.15, ease: "power1.in" }, 0.85)
                   .to(cards[1], { opacity: 0, scale: 0.75, y: 30, duration: 0.15, ease: "power1.in" }, 0.85)
                   .to(cards[2], { opacity: 0, scale: 0.75, y: 30, duration: 0.15, ease: "power1.in" }, 0.85)
                   .to(".arena-organizer-block", { opacity: 0, duration: 0.15, ease: "power1.in" }, 0.85)
                   .to(".arena-enter-button", { opacity: 0, duration: 0.15, ease: "power1.in" }, 0.85);
      });
    }, containerRef);

    return () => {
      scrollCtx.revert();
    };
  }, [entranceFinished, containerRef, arenasRef]);

  return {
    stackRef,
    cardRefs,
    activeTimer,
    showCarouselControls: false,
    handleCycleStack: (_direction?: "next" | "prev") => {},
  };
}
