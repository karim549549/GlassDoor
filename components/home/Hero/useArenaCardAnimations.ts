"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface UseArenaCardAnimationsArgs {
  containerRef: React.RefObject<HTMLDivElement | null>;
  arenasRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Owns every GSAP/ScrollTrigger timeline that drives the Hero arena-card stack:
 * the entrance intro, the scroll-linked pin/slide/fade sequence across the
 * Hero -> Arenas -> pink sections, the live countdown, and the manual
 * carousel-cycle interaction. Kept separate from HeroArenaCard's markup so the
 * animation wiring can be reasoned about independently of the render tree.
 */
export function useArenaCardAnimations({ containerRef, arenasRef }: UseArenaCardAnimationsArgs) {
  const stackRef = useRef<HTMLDivElement>(null);

  // Refs for each card element
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Countdown state for the top active card
  const [activeTimer, setActiveTimer] = useState("05:12:43");

  // Track when the entrance animation finishes to safely initialize ScrollTrigger
  const [entranceFinished, setEntranceFinished] = useState(false);

  // Track active state of carousel buttons when user enters Section 3
  const [showCarouselControls, setShowCarouselControls] = useState(false);

  // Storing stacking state refs for reordering animations
  const zIndices = useRef<number[]>([10, 20, 30]);
  const stackOrder = useRef<number[]>([0, 1, 2]); // indices mapping to ARENA_CARDS

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

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cards = cardRefs.current;
    if (!cards || cards.length === 0) return;

    // GSAP matchMedia to only run entrance animations on desktop screens
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Lock page scroll on initial load to prevent user from scrolling during card entrance
        document.body.style.overflow = "hidden";

        // Set initial scattered positions completely OUTSIDE the screen frame/viewport
        gsap.set(cards[0], { opacity: 0, x: -1400, y: 1000, rotate: -75, scale: 0.8 });
        gsap.set(cards[1], { opacity: 0, x: 1400, y: -1000, rotate: 65, scale: 0.9 });
        gsap.set(cards[2], { opacity: 0, x: -1200, y: -1200, rotate: -90, scale: 1.0 });

        const tl = gsap.timeline({ delay: 0.4 });
        const scaleBase = 1.5;

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
              document.body.style.overflow = "";
              setEntranceFinished(true);
            }
          }, "-=0.85");
      });

      mm.add("(max-width: 767px)", () => {
        // On mobile, bypass entrance animation state locks instantly
        setEntranceFinished(true);
      });
    }, stackRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = ""; // Ensure scroll is restored on unmount
    };
  }, []);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    if (!entranceFinished || !containerRef.current || !arenasRef.current) return;

    const cards = cardRefs.current;
    if (!cards) return;

    const scrollCtx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Only mount scroll animations on desktop devices
      mm.add("(min-width: 768px)", () => {
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
        const pinTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: arenasRef.current,
            start: "top top",    // Pin exactly when top of ArenasSection hits top of screen
            end: "+=1800",       // Lock/Pin duration scroll length
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

        // Trigger 4: Fade and slide cards smoothly out as user scrolls from ArenasSection down into Section 3
        const pinkTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".pink-section-container",
            start: "top bottom", // Starts as soon as section enters from bottom
            end: "top 40%",      // Fades out gracefully behind section
            scrub: true,
          }
        });

        // Cards smoothly transition and fade out behind Section 3
        pinkTimeline.to(cards[0], { y: "40vh", opacity: 0, scale: 0.8, ease: "power1.inOut" }, 0);
        pinkTimeline.to(cards[1], { y: "40vh", opacity: 0, scale: 0.8, ease: "power1.inOut" }, 0);
        pinkTimeline.to(cards[2], { y: "40vh", opacity: 0, scale: 0.8, ease: "power1.inOut" }, 0);

        // Maintain unified seamless dark mode across Sections 2 and 3 (#0E0E0D)
        pinkTimeline.to(".pink-section-container", {
          backgroundColor: "#0E0E0D",
          color: "#F1EFE9",
          borderColor: "rgba(241, 239, 233, 0.15)",
          ease: "none"
        }, 0);
      });

      // Dedicated ScrollTrigger to manage carousel controls visibility when Section 3 is visible
      ScrollTrigger.create({
        trigger: ".pink-section-container",
        start: "top 60%",       // Fade in when Section 3 is 60% into the viewport
        end: "bottom 40%",     // Fade out when scrolling past Section 3
        onToggle: (self) => {
          setShowCarouselControls(self.isActive);
        },
        onUpdate: (self) => {
          setShowCarouselControls(self.isActive);
        }
      });
    }, containerRef);

    return () => {
      scrollCtx.revert();
    };
  }, [entranceFinished, containerRef, arenasRef]);

  // Swipe Carousel interaction (reorder stacked cards via GSAP translations on click)
  const handleCycleStack = (direction: "next" | "prev") => {
    const cards = cardRefs.current;
    if (!cards) return;

    const baseScale = 1.5;
    const baseOffsetX = 420;

    // Get current top card in visual hierarchy
    const topCardIdx = direction === "next"
      ? stackOrder.current[2] // Last element in array is currently on top
      : stackOrder.current[0]; // Bottom card to bring to top

    const targetCard = cards[topCardIdx];
    if (!targetCard) return;

    // 1. Swipe current card out to the right/left
    const swipeOutX = baseOffsetX + (direction === "next" ? 220 : -220);

    gsap.timeline()
      .to(targetCard, {
        x: swipeOutX,
        rotate: direction === "next" ? 15 : -15,
        scale: baseScale * 0.95,
        duration: 0.24,
        ease: "power2.out",
        onComplete: () => {
          // 2. Re-arrange visual layer indices inside DOM
          if (direction === "next") {
            // Cycle order array (move top element to bottom of hierarchy)
            const first = stackOrder.current.shift() ?? 0;
            stackOrder.current.push(first);
          } else {
            // Cycle backwards (bring bottom element to top of hierarchy)
            const last = stackOrder.current.pop() ?? 0;
            stackOrder.current.unshift(last);
          }

          // Apply updated z-index layering rules to DOM elements
          stackOrder.current.forEach((cardIdx, layerIndex) => {
            const cardEl = cards[cardIdx];
            if (cardEl) {
              const newZ = (layerIndex + 1) * 10;
              gsap.set(cardEl, { zIndex: newZ });
            }
          });

          // 3. Swipe card back underneath the new stack top
          const newRotation = [-4, 3, -1.5][stackOrder.current.indexOf(topCardIdx)];
          const newScale = baseScale;

          gsap.to(targetCard, {
            x: baseOffsetX,
            y: "100vh",
            rotate: newRotation,
            scale: newScale,
            duration: 0.28,
            ease: "back.out(1.1)"
          });
        }
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
