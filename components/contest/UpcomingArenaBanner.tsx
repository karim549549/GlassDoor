"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Timer, ArrowRight, Play } from "lucide-react";

interface BannerContest {
  id: string;
  title: string;
  implPhaseEnd: string;
  status: string;
}

interface UpcomingArenaBannerProps {
  contest: BannerContest | null;
}

export function UpcomingArenaBanner({ contest }: UpcomingArenaBannerProps) {
  const [activeTimer, setActiveTimer] = useState("00:00:00");

  useEffect(() => {
    if (!contest) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(contest.implPhaseEnd).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setActiveTimer("00:00:00");
        clearInterval(interval);
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const hrsStr = hrs.toString().padStart(2, "0");
      const minsStr = mins.toString().padStart(2, "0");
      const secsStr = secs.toString().padStart(2, "0");

      setActiveTimer(`${hrsStr}:${minsStr}:${secsStr}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  if (!contest) {
    return (
      <div className="border-2 border-dashed border-[#0E0E0D]/30 p-4 flex flex-col sm:flex-row items-center justify-between bg-[#E4E1D9]/15 text-muted-foreground gap-4 font-mono text-[0.55rem] uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground/50" />
          <span>No active arenas registered for today.</span>
        </div>
        <Link 
          href="/contest/create"
          className="text-accent hover:underline font-bold"
        >
          [HOST AN ARENA SPRINT NOW]
        </Link>
      </div>
    );
  }

  const [hours, minutes, seconds] = activeTimer.split(":");

  return (
    <div className="border-2 border-[#0E0E0D] bg-accent text-[#FAFAF8] p-4 md:px-6 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#0E0E0D] relative overflow-hidden">
      
      {/* Editorial Grid Backing Overlay */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="banner-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#banner-grid)" />
        </svg>
      </div>

      <div className="relative z-10 space-y-1.5 text-left max-w-xl">
        <span className="font-mono text-[0.48rem] font-bold uppercase tracking-[0.25em] text-[#FAFAF8]/85 flex items-center gap-1.5">
          <Play className="h-3 w-3 fill-current animate-pulse text-[#FAFAF8]" /> — today's active sprint lobby —
        </span>
        <h2 className="font-display italic text-lg md:text-2xl font-normal leading-tight uppercase tracking-tight text-[#FAFAF8]">
          {contest.title}
        </h2>
      </div>

      <div className="relative z-10 flex items-center gap-4 max-sm:w-full max-sm:justify-between shrink-0">
        {/* Timer Lockup */}
        <div className="flex flex-col text-left">
          <span className="font-mono text-[0.42rem] uppercase tracking-[0.2em] text-[#FAFAF8]/75 font-bold mb-0.5">
            TIME REMAINING
          </span>
          <div className="font-mono text-xl md:text-2xl font-bold tracking-widest leading-none flex items-center">
            <span>{hours}</span>
            <span className="animate-pulse text-[#FAFAF8]/50">:</span>
            <span>{minutes}</span>
            <span className="animate-pulse text-[#FAFAF8]/50">:</span>
            <span className="text-[#FAF8F5]">{seconds}</span>
          </div>
        </div>

        {/* Enter Button */}
        <Link
          href={`/contest/${contest.id}`}
          className="px-4 py-2 bg-[#FAFAF8] text-[#0E0E0D] border border-[#0E0E0D] font-mono text-[0.55rem] font-bold tracking-widest uppercase hover:bg-[#0E0E0D] hover:text-[#FAFAF8] transition-colors shadow-[2px_2px_0px_0px_#0E0E0D] active:translate-y-0.5 flex items-center gap-1"
        >
          ENTER LOBBY <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

    </div>
  );
}

export default UpcomingArenaBanner;
