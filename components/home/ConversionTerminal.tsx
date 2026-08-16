"use client";

import React from "react";
import Link from "next/link";
import { Terminal, ArrowRight, PenLine, Zap } from "lucide-react";
import { HUDCornerReticle } from "./HUDCornerReticle";
import { LeaderboardRail } from "./LeaderboardRail";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import type { GlobalStanding } from "@/lib/arena/leaderboard-service";

/**
 * The ask, and the standings beside it.
 *
 * The rail lives here rather than in section 2 for a reason: it is the only
 * thing on the page reporting on people, and it belongs next to the invitation
 * to become one of them, not next to a list of arenas.
 */
export function ConversionTerminal({ standings = [] }: { standings?: GlobalStanding[] }) {
  return (
    <section className="relative z-20 w-full py-24 md:py-36 px-6 md:px-12 bg-background border-b border-foreground/20 overflow-hidden">
      <BackgroundGrid opacity={0.09} />
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
        <div className="flex-1 min-w-0">
        <HUDCornerReticle
          label="INITIALIZATION TERMINAL // CAIRO NETWORK"
          coordinate="STATUS: READY FOR INGEST"
          className="border-2 border-foreground bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_var(--foreground)] space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-orange-ink">
              <Terminal className="w-4 h-4" />
              <span>&gt; PICK SOMETHING AND BUILD IT</span>
            </div>

            <h2 className="font-display italic text-[clamp(2rem,4.5vw,3.8rem)] leading-tight uppercase font-normal text-foreground">
              What are you doing Saturday?
            </h2>

            <p className="font-sans text-sm md:text-base text-foreground/80 max-w-2xl leading-relaxed">
              Enter an open challenge, or write a brief of your own and see who
              turns up. Free either way. If you like what you built you can keep
              the record of it &mdash; but that is a souvenir, not the point.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-foreground/15">
            <Link
              href="/arena"
              className="px-8 py-4 bg-orange text-card font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_var(--foreground)] hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>SEE OPEN CHALLENGES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Was "EMPLOYER TALENT PIPELINE" -> /recruiter, given equal weight
                to the entrant action on the page's closing CTA. The employer
                surfaces still exist and still work; this slot belongs to the
                core loop, which is that anyone can start a challenge. */}
            <Link
              href="/arena/create"
              className="px-8 py-4 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_var(--orange)] hover:bg-orange hover:text-card transition-all flex items-center justify-center gap-2"
            >
              <PenLine className="w-4 h-4" />
              <span>WRITE A BRIEF</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* "NEXT GLICKO-2 BATCH: SUNDAY 00:00 UTC" and "ALL SYSTEMS
              OPERATIONAL" were both hardcoded assertions about running
              infrastructure. Replaced with things that are true regardless of
              state. */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[0.55rem] text-muted-foreground">
            <span>DEVS ARENA // CAIRO</span>
            <span>NO ENTRY FEE, EVER</span>
            <span className="text-orange-ink font-bold">SOLO OR TEAMS OF 2&ndash;4</span>
          </div>
        </HUDCornerReticle>
        </div>

        {/* Standings sit beside the invitation, not beside the arena list. */}
        <div className="w-full lg:w-[19rem] shrink-0 text-foreground">
          <LeaderboardRail standings={standings} />
        </div>
      </div>
    </section>
  );
}
