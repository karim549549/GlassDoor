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
 * Choreography for the fanned arena card stack.
 *
 * Three defects were fixed here; all three produced the same symptom, a page
 * that would not scroll.
 *
 * 1. The entrance used to set `document.body.style.overflow = "hidden"` and
 *    only restore it from the final tween's `onComplete`. Any path that skipped
 *    that callback - a null card ref, a matchMedia revert on resize, a
 *    StrictMode double-invoke, a tab backgrounded mid-tween - left the document
 *    permanently unscrollable. The lock is gone entirely: the entrance now
 *    plays over a page the reader can always scroll.
 *
 * 2. ScrollTrigger setup was gated on an `entranceFinished` flag set by that
 *    same callback, so the identical failure also meant no scroll animation was
 *    ever created. Setup is now driven by a timeline completion *or* a hard
 *    timeout, so it cannot be stranded by one missed callback.
 *
 * 3. `scrub: true` snaps to scroll position every frame and reads as jitter.
 *    Numeric scrub gives ScrollTrigger a smoothing window instead.
 */

/** Entrance duration is ~1.4s; this only has to outlast it. */
const ENTRANCE_FALLBACK_MS = 2600;

export function useArenaCardAnimations({ containerRef, arenasRef }: UseArenaCardAnimationsArgs) {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeTimer, setActiveTimer] = useState("05:12:43");
  const [entranceFinished, setEntranceFinished] = useState(false);

  // Live sprint timer countdown.
  useEffect(() => {
    let totalSeconds = 5 * 3600 + 12 * 60 + 43;

    const format = (s: number) => {
      const hrs = Math.floor(s / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const secs = s % 60;
      // Minutes used to be dropped here - the clock read `hrs:secs`, so it
      // looked like a minute counter running 60x fast.
      return [hrs, mins, secs].map((n) => n.toString().padStart(2, "0")).join(":");
    };

    // No priming call here: the initial state below is already `format()` of
    // this same starting value, and setting state synchronously in an effect
    // just costs a second render.
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

  // Entrance fly-in. Never blocks scrolling.
  useEffect(() => {
    const cards = cardRefs.current;
    if (!cards || cards.length === 0) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const [a, b, c] = cards;
        if (!a || !b || !c) {
          // Nothing to animate - hand off immediately rather than leaving the
          // scroll choreography waiting on a tween that will never run.
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

    // Belt and braces: whatever happens to the timeline above, the scroll
    // choreography gets built.
    const fallback = window.setTimeout(() => setEntranceFinished(true), ENTRANCE_FALLBACK_MS);

    return () => {
      window.clearTimeout(fallback);
      ctx.revert();
    };
  }, []);

  // Re-measure once the entrance has landed. The slide timeline records its
  // starting `y` when it is built, and at that moment the cards are still
  // mid-flight; `invalidateOnRefresh` on that timeline makes this refresh
  // re-read the settled values. This is what the old `entranceFinished` gate
  // was really for, without gating trigger *creation* on a callback that could
  // never fire.
  useEffect(() => {
    if (!entranceFinished) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [entranceFinished]);

  // Scroll choreography. Built on mount, alongside every other trigger on the
  // page, so all of them measure against the same layout.
  useEffect(() => {
    const container = containerRef.current;
    const arenas = arenasRef.current;
    if (!container || !arenas) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length < 3) return;

    const scrollCtx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Hero fades out and the arenas panel darkens as it arrives.
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

        // Cards ride down into the panel.
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
          .to(cards, { y: 0, ease: "none" }, 0);

        // Pinned docking sequence: separate, label, then clear.
        const dock = gsap.timeline({
          scrollTrigger: {
            trigger: arenas,
            start: "top top",
            end: "+=1600",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // Highest priority on the page: this pin sits above every other
            // trigger, and its 1600px spacer moves all of them. It has to
            // re-measure first or everything below it reads a stale offset.
            refreshPriority: 2,
          },
        });

        dock
          .to(cards[0], { x: -500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.65 }, 0)
          .to(cards[1], { x: 0, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.65 }, 0)
          .to(cards[2], { x: 500, scale: 0.9, rotate: 0, ease: "power1.inOut", duration: 0.65 }, 0)
          .to(".arena-organizer-block", { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.65)
          .to(".arena-enter-button", { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.65)
          .to(".arena-organizer-block", { opacity: 0, duration: 0.12, ease: "power1.in" }, 0.76)
          .to(".arena-enter-button", { opacity: 0, duration: 0.12, ease: "power1.in" }, 0.76)
          // Everything from here overlaps deliberately - regroup, fade and
          // descent all run at once with per-card offsets, so nothing snaps
          // and no card changes state at the same instant as its neighbours.
          //
          // Regroup: the three docked cards slide back into the fanned stack
          // they arrived as, same offsets and same slight rotations, one after
          // another - so the stack visibly reassembles rather than three cards
          // happening to converge.
          .to(cards[2], { x: 0, rotate: -1.5, scale: 1.05, duration: 0.18, ease: "power2.inOut" }, 0.78)
          .to(cards[1], { x: 0, rotate: 3, scale: 1.05, duration: 0.18, ease: "power2.inOut" }, 0.82)
          .to(cards[0], { x: 0, rotate: -4, scale: 1.05, duration: 0.18, ease: "power2.inOut" }, 0.86)
          // Fade starts while the regroup is still moving and finishes as the
          // stack leaves, so the cards dissolve across the whole exit instead
          // of blinking out at the end of it.
          .to(cards[2], { opacity: 0, duration: 0.22, ease: "power1.in" }, 0.84)
          .to(cards[1], { opacity: 0, duration: 0.22, ease: "power1.in" }, 0.88)
          .to(cards[0], { opacity: 0, duration: 0.22, ease: "power1.in" }, 0.92)
          // Descent overlaps the fade. The cards stay mounted throughout and
          // pass behind the next section, which outranks this one in the
          // stacking order, so a later section can bring the same stack back.
          // Function-based so the distance is re-read on every refresh.
          .to(
            cards,
            {
              y: () => window.innerHeight * 1.05,
              duration: 0.22,
              ease: "power2.in",
              stagger: 0.03,
            },
            0.86
          );
      });

      // Allocate the pin distances into the spacers now that every trigger on
      // the page exists. Without this the spacers stay at their natural height
      // with no padding, and no section actually pins.
      ScrollTrigger.refresh();
    }, container);

    return () => scrollCtx.revert();
  }, [containerRef, arenasRef]);

  return {
    stackRef,
    cardRefs,
    activeTimer,
    showCarouselControls: false,
    handleCycleStack: (_direction?: "next" | "prev") => {},
  };
}
