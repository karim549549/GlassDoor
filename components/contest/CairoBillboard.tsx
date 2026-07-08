import React from "react";
import Link from "next/link";
import { Trophy, Shield } from "lucide-react";
import type { ContestListItem } from "@/lib/contest/types";

type BillboardContest = Pick<ContestListItem, "id" | "title" | "isPrivate" | "status"> & {
  participantCount: number;
};

interface CairoBillboardProps {
  contests: BillboardContest[];
}

export function CairoBillboard({ contests }: CairoBillboardProps) {
  // Display top 10 items directly
  const topContests = contests.slice(0, 10);

  return (
    <div className="border-2 border-[#0E0E0D] bg-white p-5 shadow-[4px_4px_0px_0px_#0E0E0D] relative flex flex-col h-full justify-between">
      
      {/* Decorative inner borders */}
      <div className="absolute inset-1 border border-[#0E0E0D]/10 pointer-events-none" />
      <div className="absolute inset-1.5 border border-dashed border-[#0E0E0D]/5 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="border-b-2 border-double border-[#0E0E0D] pb-3 text-left">
          <span className="font-mono text-[0.45rem] text-orange uppercase tracking-[0.25em] font-bold block mb-1">
            [STANDINGS / LEADERBOARD]
          </span>
          <h2 className="font-display italic text-xl uppercase tracking-tight text-[#0E0E0D]">
            Cairo Billboard
          </h2>
          <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed mt-1">
            Top active arenas sorted by developer deployments.
          </p>
        </div>

        {/* Board Table */}
        <div className="space-y-2 text-left">
          {topContests.length > 0 ? (
            topContests.map((contest, index) => {
              const rankStr = (index + 1).toString().padStart(2, "0");
              return (
                <div 
                  key={contest.id} 
                  className="flex items-center justify-between border-b border-[#0E0E0D]/10 py-2 font-mono text-[0.58rem]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="font-bold text-orange">#{rankStr}</span>
                    <span className="font-sans font-medium text-[#0E0E0D] uppercase truncate max-w-[130px]">
                      {contest.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="bg-[#E4E1D9]/40 text-[#0E0E0D] px-1 py-0.5 border border-border/60">
                      {contest.participantCount} DEVS
                    </span>
                    {contest.isPrivate ? (
                      <Shield className="h-3 w-3 text-muted-foreground/60" />
                    ) : (
                      <Trophy className="h-3 w-3 text-orange" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center font-mono text-muted-foreground uppercase text-[0.55rem] tracking-wider">
              No active arenas reported
            </div>
          )}
        </div>
      </div>

      {/* See More button at the bottom */}
      <div className="pt-4 mt-3 border-t border-dashed border-[#0E0E0D]/10 relative z-10">
        <Link
          href="/billboard"
          className="w-full py-2 bg-orange text-white border-2 border-[#0E0E0D] font-mono text-[0.58rem] font-bold tracking-widest uppercase hover:bg-transparent hover:text-[#0E0E0D] transition-all duration-150 shadow-[2px_2px_0px_0px_#0E0E0D] hover:shadow-none active:translate-y-0.5 flex items-center justify-center gap-1"
        >
          See More Standings [→]
        </Link>
      </div>

    </div>
  );
}

export default CairoBillboard;
