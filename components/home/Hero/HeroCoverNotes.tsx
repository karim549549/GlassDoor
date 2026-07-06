"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import Link from "next/link";

export function HeroCoverNotes() {
  return (
    <>
      {/* TOP LEFT — Salary database label */}
      <div
        className="absolute border border-border px-2 py-1.5 hidden sm:block z-20 text-[#0E0E0D]"
        style={{ top: "clamp(130px, 24%, 220px)", left: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        <div
          className="font-mono uppercase tracking-[0.22em] text-muted-foreground leading-relaxed"
          style={{ fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }}
        >
          No. 1 salary<br />database in Egypt
        </div>
      </div>

      {/* TOP RIGHT — Companies count */}
      <div
        className="absolute text-right hidden sm:block z-20 text-[#0E0E0D]"
        style={{ top: "clamp(116px, 21%, 200px)", right: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        <div className="font-mono" style={{ fontSize: "clamp(2rem, 3.8vw, 3.5rem)", fontWeight: 500, lineHeight: 1 }}>
          <AnimatedCounter value="312" />
        </div>
        <div
          className="font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1"
          style={{ fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }}
        >
          Companies<br />Indexed
        </div>
      </div>

      {/* LEFT MIDDLE — Exclusive highlight */}
      <div
        className="absolute hidden lg:block z-20 text-[#0E0E0D]"
        style={{ top: "37%", left: "clamp(1rem, 2.5vw, 2rem)", maxWidth: "clamp(120px, 13vw, 170px)" }}
      >
        <div className="font-mono text-[0.52rem] text-orange uppercase mb-1" style={{ letterSpacing: "0.18em" }}>
          Exclusive
        </div>
        <div className="font-display" style={{ fontSize: "clamp(0.85rem, 1.1vw, 1.05rem)", lineHeight: 1.25, fontStyle: "italic" }}>
          Vodafone Egypt: The full salary picture
        </div>
      </div>

      {/* RIGHT MIDDLE — Verified engineers count */}
      <div
        className="absolute border-2 border-foreground text-center hidden md:block z-20 text-[#0E0E0D]"
        style={{ top: "34%", right: "clamp(1rem, 2.5vw, 2rem)", padding: "clamp(0.5rem, 1vw, 0.875rem) clamp(0.75rem, 1.5vw, 1.25rem)" }}
      >
        <div className="font-mono text-[0.48rem] uppercase tracking-[0.22em] text-muted-foreground">
          Verified by
        </div>
        <div className="font-mono text-orange" style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)", fontWeight: 500, lineHeight: 1.1 }}>
          <AnimatedCounter value="4,200+" />
        </div>
        <div className="font-mono text-[0.48rem] uppercase tracking-[0.18em] text-muted-foreground">
          Egyptian<br />engineers
        </div>
      </div>

      {/* BOTTOM RIGHT — Platform pillars & Connect/Join Arena Typography */}
      <div
        className="absolute text-right hidden sm:block z-20 text-[#0E0E0D]"
        style={{ bottom: "clamp(45px, 9vh, 75px)", right: "clamp(1rem, 3vw, 2.5rem)" }}
      >
        {/* Platform Pillars stacked list */}
        <div
          className="font-mono uppercase tracking-[0.2em] text-muted-foreground leading-[2.2] mb-6"
          style={{ fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }}
        >
          <div>Salary transparency</div>
          <div>Developer profiles</div>
          <div className="text-foreground font-bold">Devs arenas</div>
        </div>

        {/* JOIN AN OPEN SEAT Typography with orange background span highlight */}
        <Link href="/context" className="inline-block text-right group select-none">
          <span className="block font-display italic text-[clamp(1.2rem,2.8vw,2.2rem)] text-[#0E0E0D] leading-none uppercase pr-1">
            Join an
          </span>
          <span className="relative inline-block font-display italic text-[clamp(1.35rem,3.1vw,2.5rem)] text-[#F1EFE9] leading-none uppercase px-3 py-1 mt-1 bg-orange font-bold transition-transform duration-150 group-hover:scale-[1.02]">
            Open seat &rarr;
          </span>
        </Link>
      </div>

      {/* CENTER BOTTOM STRIP — Live platform activity ticker */}
      <div
        className="absolute left-0 right-0 border-t border-border overflow-hidden hidden sm:flex items-center z-20 text-[#0E0E0D]"
        style={{ bottom: 0, height: "clamp(28px, 4vh, 38px)" }}
      >
        <div
          className="font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap animate-[marquee_28s_linear_infinite] flex gap-12"
          style={{ fontSize: "clamp(0.42rem, 0.55vw, 0.52rem)" }}
        >
          {[
            "Vodafone Egypt · EGP 42,000 median",
            "Backend +12% since Q1",
            "2 Arenas live now",
            "Amazon Egypt · EGP 68,000 median",
            "128 developers connected this week",
            "Instabug · EGP 55,000 median",
            "New Arena: Full-Stack Sprint · 6 hrs",
            "Breadfast · EGP 38,000 median",
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-orange">·</span>
              {item}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            "Vodafone Egypt · EGP 42,000 median",
            "Backend +12% since Q1",
            "2 Arenas live now",
            "Amazon Egypt · EGP 68,000 median",
            "128 developers connected this week",
            "Instabug · EGP 55,000 median",
            "New Arena: Full-Stack Sprint · 6 hrs",
            "Breadfast · EGP 38,000 median",
          ].map((item, i) => (
            <span key={`dup-${i}`} className="flex items-center gap-2">
              <span className="text-orange">·</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
export default HeroCoverNotes;
