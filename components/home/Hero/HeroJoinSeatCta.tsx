"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * The "Join an Open Seat" CTA typography with its GSAP entrance timeline and
 * highly engineered hover sequence (background block skew/scale, floating
 * text offset, arrow flythrough). Isolated from the rest of the Hero cover
 * because it owns a dedicated set of animation refs and handlers.
 */
export function HeroJoinSeatCta() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const joinAnRef = useRef<HTMLSpanElement>(null);
  const bgBlockRef = useRef<HTMLSpanElement>(null);
  const textOverlayRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Mount Entrance Animation
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(joinAnRef.current, { opacity: 0, y: -15 });
      gsap.set(bgBlockRef.current, { scaleX: 0, transformOrigin: "right center" });
      gsap.set(textOverlayRef.current, { opacity: 0 });

      // Run Timeline
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to(joinAnRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
        .to(bgBlockRef.current, { scaleX: 1, duration: 0.7, ease: "power3.out" }, "-=0.3")
        .to(textOverlayRef.current, { opacity: 1, duration: 0.4 }, "-=0.4");
    }, linkRef);

    return () => ctx.revert();
  }, []);

  // Highly Engineered Hover Animation Sequence
  const handleMouseEnter = () => {
    // Springy elastic stretch on the background highlight block
    gsap.to(bgBlockRef.current, {
      skewX: -12,
      scaleX: 1.06,
      scaleY: 1.04,
      duration: 0.65,
      ease: "elastic.out(1, 0.4)"
    });

    // Slight floating offset for 'Join an' text
    gsap.to(joinAnRef.current, {
      x: -6,
      y: -2,
      duration: 0.35,
      ease: "power2.out"
    });

    // Arrow flythrough wrap-around animation
    const arrow = arrowRef.current;
    if (arrow) {
      gsap.timeline()
        .to(arrow, { x: 20, opacity: 0, duration: 0.15, ease: "power2.in" })
        .set(arrow, { x: -20 })
        .to(arrow, { x: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    // Smooth release back to resting states
    gsap.to(bgBlockRef.current, {
      skewX: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.45,
      ease: "power2.out"
    });

    gsap.to(joinAnRef.current, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: "power2.out"
    });

    gsap.to(arrowRef.current, {
      x: 0,
      opacity: 1,
      duration: 0.45,
      ease: "power2.out"
    });
  };

  return (
    <Link
      ref={linkRef}
      href="/context"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block text-right group select-none cursor-pointer"
    >
      <span
        ref={joinAnRef}
        className="block font-display italic text-[clamp(1.2rem,2.8vw,2.2rem)] text-foreground leading-none uppercase pr-1.5"
      >
        Join an
      </span>

      <span className="relative inline-block font-display italic text-[clamp(1.35rem,3.1vw,2.5rem)] text-background leading-none uppercase px-3 py-1.5 mt-1 font-bold">
        {/* Background block animation element */}
        <span
          ref={bgBlockRef}
          className="absolute inset-0 bg-orange -z-10"
        />
        {/* Text and arrow animation element */}
        <span ref={textOverlayRef} className="relative z-10 flex items-center gap-1.5">
          Open seat{" "}
          <span ref={arrowRef} className="inline-block">&rarr;</span>
        </span>
      </span>
    </Link>
  );
}

export default HeroJoinSeatCta;
