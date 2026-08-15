import React from "react";
import { Trophy, ShieldCheck, Zap, Activity } from "lucide-react";
import type { UserRatingState, UserArenaEntry } from "../types";

interface ArenaStatsCardProps {
  rating: number;
  ratingStates?: UserRatingState[];
  arenaEntries?: UserArenaEntry[];
}

export const ArenaStatsCard = React.memo(function ArenaStatsCard({
  rating,
  ratingStates = [],
  arenaEntries = [],
}: ArenaStatsCardProps) {
  const completedEntries = arenaEntries.filter((e) => e.submission !== null);
  const proofPacketsCount = arenaEntries.filter(
    (e) => e.submission?.proofPacket && !e.submission.proofPacket.isRevoked
  ).length;

  const highestRating =
    ratingStates.length > 0
      ? Math.max(...ratingStates.map((s) => Math.round(s.rating)))
      : rating || 1500;

  return (
    <div className="relative overflow-hidden border-2 border-foreground bg-white p-6 font-mono text-[0.65rem] uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--foreground)] flex flex-col justify-between gap-5">
      <div className="flex items-center justify-between border-b-2 border-foreground pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange" />
          <h3 className="font-bold text-sm text-foreground">Verified Ratings</h3>
        </div>
        <span className="font-mono text-[0.58rem] bg-secondary px-2 py-0.5 border border-foreground/20 font-bold text-foreground">
          GLICKO-2
        </span>
      </div>

      {/* Main Overall Rating Block */}
      <div className="p-4 bg-foreground text-background shadow-[3px_3px_0px_0px_rgba(0,0,0,0.25)] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-background/60 text-[0.55rem] tracking-widest font-bold">
            PRIMARY RATING
          </span>
          <Zap className="w-3.5 h-3.5 text-orange" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-orange">{rating || 1500}</span>
          <span className="text-[0.6rem] text-background/60">
            {rating >= 2000 ? "Grandmaster" : rating >= 1700 ? "Master" : rating >= 1400 ? "Specialist" : "Apprentice"}
          </span>
        </div>
      </div>

      {/* Per-Domain Ratings Breakdown */}
      <div className="space-y-2">
        <span className="text-muted-foreground text-[0.58rem] tracking-widest block font-bold">
          Domain Specializations
        </span>
        {ratingStates.length === 0 ? (
          <div className="p-3 bg-secondary/30 border border-foreground/10 text-muted-foreground text-[0.6rem] text-center">
            Complete your first arena to establish domain ratings.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {ratingStates.map((state) => (
              <div
                key={state.domain}
                className="p-2.5 bg-secondary/40 border border-foreground/15 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-foreground block text-[0.65rem]">
                    {state.domain.replace(/_/g, " ")}
                  </span>
                  <span className="text-[0.52rem] text-muted-foreground">
                    &plusmn;{Math.round(state.deviation)} RD
                  </span>
                </div>
                <span className="text-sm font-bold text-orange">
                  {Math.round(state.rating)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Track Record Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-foreground/10">
        <div className="p-2.5 border border-foreground/20 bg-secondary/20">
          <div className="flex items-center gap-1 text-muted-foreground text-[0.52rem] font-bold">
            <Activity className="w-3 h-3 text-orange" />
            <span>SUBMISSIONS</span>
          </div>
          <span className="text-base font-bold text-foreground mt-1 block">
            {completedEntries.length}
          </span>
        </div>

        <div className="p-2.5 border border-foreground/20 bg-secondary/20">
          <div className="flex items-center gap-1 text-muted-foreground text-[0.52rem] font-bold">
            <ShieldCheck className="w-3 h-3 text-orange" />
            <span>PROOF PACKETS</span>
          </div>
          <span className="text-base font-bold text-foreground mt-1 block">
            {proofPacketsCount}
          </span>
        </div>
      </div>
    </div>
  );
});
