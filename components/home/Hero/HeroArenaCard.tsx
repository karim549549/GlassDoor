"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Terminal, Clock, Code2 } from "lucide-react";

export function HeroArenaCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Target countdown: 5 hours 12 mins 43 secs from now for demo
  const [timeLeft, setTimeLeft] = useState({
    hours: "05",
    minutes: "12",
    seconds: "43",
  });

  useEffect(() => {
    // Initial paper drop/slap entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 1.15, rotate: -6, y: -50 },
        { opacity: 1, scale: 1, rotate: -2, y: 0, duration: 0.85, ease: "back.out(1.3)" }
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
      scale: 1.03,
      y: -8,
      boxShadow: "6px 6px 0px 0px rgba(14,14,13,1)",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotate: -2,
      scale: 1,
      y: 0,
      boxShadow: "3px 3px 0px 0px rgba(14,14,13,0.85)",
      duration: 0.45,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute left-1/2 z-25 w-[min(480px,90%)] bg-[#FAFAF8] text-[#0E0E0D] border-2 border-[#0E0E0D] p-5 cursor-pointer select-none transition-shadow"
      style={{
        top: "43%",
        transform: "translate(-50%, -50%) rotate(-2deg)",
        boxShadow: "3px 3px 0px 0px rgba(14,14,13,0.85)",
      }}
    >
      {/* Outer Outline Frame Detail (Paper Texture) */}
      <div className="absolute inset-1 border border-[#0E0E0D]/10 pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-[#0E0E0D]/20 mb-4 text-left">
        <span className="font-mono text-[0.52rem] uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1.5 font-bold">
          <Terminal className="h-3.5 w-3.5 text-orange" /> Arena Challenge
        </span>
        <span className="font-mono text-[0.48rem] uppercase tracking-wider text-orange border border-orange px-1.5 py-0.5 font-bold animate-pulse">
          Live Registry
        </span>
      </div>

      {/* Title */}
      <div className="text-left mb-5">
        <h3 className="font-display italic text-[clamp(1.15rem,2.5vw,1.65rem)] leading-[1.1] text-[#0E0E0D]">
          Build a real-time developer map
        </h3>
        <p className="font-mono text-[0.52rem] text-muted-foreground uppercase mt-2 tracking-widest leading-relaxed">
          Create an interactive canvas tracking team statuses in a time-boxed sprint.
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="bg-[#0E0E0D] text-[#F1EFE9] p-4 mb-5 text-center relative border border-[#0E0E0D]">
        <div className="absolute top-1 left-2 font-mono text-[0.45rem] uppercase tracking-[0.25em] text-[#F1EFE9]/40 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" /> Begins in
        </div>
        
        <div className="flex items-center justify-center gap-3 mt-1.5">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[1.4rem] font-bold tracking-widest leading-none">{timeLeft.hours}</span>
            <span className="font-mono text-[0.4rem] uppercase tracking-wider text-[#F1EFE9]/50 mt-1">Hours</span>
          </div>
          <span className="font-mono text-[1.2rem] font-bold text-orange leading-none -mt-3">:</span>
          
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[1.4rem] font-bold tracking-widest leading-none">{timeLeft.minutes}</span>
            <span className="font-mono text-[0.4rem] uppercase tracking-wider text-[#F1EFE9]/50 mt-1">Mins</span>
          </div>
          <span className="font-mono text-[1.2rem] font-bold text-orange leading-none -mt-3">:</span>
          
          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[1.4rem] font-bold tracking-widest leading-none text-orange">{timeLeft.seconds}</span>
            <span className="font-mono text-[0.4rem] uppercase tracking-wider text-orange/70 mt-1">Secs</span>
          </div>
        </div>
      </div>

      {/* Footer Info / Tech Stack */}
      <div className="flex items-center justify-between pt-3 border-t border-[#0E0E0D]/10">
        <span className="font-mono text-[0.5rem] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Code2 className="h-3 w-3" /> Tech Stack:
        </span>
        <div className="flex gap-2">
          {["React", "Node.js", "WebSockets"].map((tech) => (
            <span
              key={tech}
              className="font-mono text-[0.48rem] uppercase tracking-wider border border-[#0E0E0D]/20 px-2 py-0.5 bg-[#0E0E0D]/5 text-[#0E0E0D]/85 font-semibold"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export default HeroArenaCard;
