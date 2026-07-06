"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function HeroArenaCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Target countdown: 5 hours 12 mins 43 secs from now for demo
  const [timeLeft, setTimeLeft] = useState({
    hours: "05",
    minutes: "12",
    seconds: "43",
  });

  useEffect(() => {
    // Initial paper drop/slap entrance animation (elastic back.out)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 1.15, rotate: -6, y: -60 },
        { opacity: 1, scale: 1, rotate: -1.5, y: 0, duration: 0.9, ease: "back.out(1.3)" }
      );
    }, cardRef);

    // Dynamic Countdown Timer
    let totalSeconds = 5 * 3600 + 12 * 60 + 43;
    const interval = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(interval);
        return;
      }
      totalSeconds -= 1;
      
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setTimeLeft({
        hours: hrs.toString().padStart(2, "0"),
        minutes: mins.toString().padStart(2, "0"),
        seconds: secs.toString().padStart(2, "0"),
      });
    }, 1000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      rotate: 0,
      scale: 1.025,
      y: -8,
      boxShadow: "8px 8px 0px 0px rgba(14,14,13,1)",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotate: -1.5,
      scale: 1,
      y: 0,
      boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.9)",
      duration: 0.45,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute left-1/2 z-25 w-[min(540px,94%)] min-h-[310px] bg-[#FAF8F5] text-[#0E0E0D] border-4 border-double border-[#0E0E0D] p-7 md:p-9 cursor-pointer select-none transition-shadow text-left flex flex-col justify-between"
      style={{
        top: "43%",
        transform: "translate(-50%, -50%) rotate(-1.5deg)",
        boxShadow: "4px 4px 0px 0px rgba(14,14,13,0.9)",
      }}
    >
      {/* Structural blueprint visual outlines */}
      <div className="absolute inset-1 border border-[#0E0E0D]/10 pointer-events-none" />
      <div className="absolute inset-1.5 border border-dashed border-[#0E0E0D]/5 pointer-events-none" />

      {/* Main Poster Content Lockup (All in one typographic flow) */}
      <div className="space-y-4">
        <div className="font-display italic text-[clamp(1.4rem,3.2vw,2.3rem)] leading-[1.08] text-[#0E0E0D] tracking-tight">
          <span className="text-orange font-bold not-italic font-mono text-[0.65rem] tracking-[0.25em] border border-orange px-2 py-0.5 inline-block mr-3.5 align-middle -translate-y-0.5">
            [ARENA CHALLENGE]
          </span>
          BUILD A REAL-TIME DEVELOPER MAP
        </div>
        
        <p className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-md">
          Create an interactive map tracking live developer profiles and statuses during a 6-hour sprint.
        </p>
      </div>

      {/* Bottom Area: Timer Left, Tech Badges Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-dashed border-[#0E0E0D]/20 mt-6">
        
        {/* Bottom Left: Countdown Timer Stamped Box */}
        <div className="flex flex-col">
          <span className="font-mono text-[0.45rem] uppercase tracking-[0.25em] text-muted-foreground mb-1 block font-bold">
            [TIME REGISTRY]
          </span>
          <div className="font-mono text-[1.25rem] font-bold text-[#0E0E0D] leading-none tracking-widest">
            {timeLeft.hours}
            <span className="text-orange animate-pulse">:</span>
            {timeLeft.minutes}
            <span className="text-orange animate-pulse">:</span>
            <span className="text-orange">{timeLeft.seconds}</span>
          </div>
        </div>

        {/* Bottom Right: Tech Stack Brackets */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {["REACT", "NODE.JS", "WEBSOCKETS"].map((tech) => (
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
}
export default HeroArenaCard;
