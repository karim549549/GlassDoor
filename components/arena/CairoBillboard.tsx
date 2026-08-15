import React from "react";
import Link from "next/link";
import { Trophy, Shield } from "lucide-react";
import type { ArenaListItem } from "@/lib/arena/types";

type BillboardArena = Pick<ArenaListItem, "id" | "title" | "isPrivate"> & {
  status: string;
  participantCount: number;
};

interface CairoBillboardProps {
  arenas: BillboardArena[];
}

export function CairoBillboard({ arenas }: CairoBillboardProps) {
  // Display top 10 items directly
  const topArenas = arenas.slice(0, 10);

  return (
    <div className="border-2 border-foreground bg-white p-5 shadow-[4px_4px_0px_0px_var(--foreground)] relative flex flex-col h-full justify-between">
      
      {/* Decorative inner borders */}
      <div className="absolute inset-1 border border-foreground/10 pointer-events-none" />
      <div className="absolute inset-1.5 border border-dashed border-foreground/5 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="border-b-2 border-double border-foreground pb-3 text-left">
          <span className="font-mono text-[0.45rem] text-orange uppercase tracking-[0.25em] font-bold block mb-1">
            [STANDINGS / LEADERBOARD]
          </span>
          <h2 className="font-display italic text-xl uppercase tracking-tight text-foreground">
            Cairo Billboard
          </h2>
          <p className="font-mono text-[0.52rem] text-muted-foreground uppercase tracking-widest leading-relaxed mt-1">
            Top active arenas sorted by developer deployments.
          </p>
        </div>

        {/* Board Table */}
        <div className="space-y-2 text-left">
          {topArenas.length > 0 ? (
            topArenas.map((arena, index) => {
              const rankStr = (index + 1).toString().padStart(2, "0");
              return (
                <div 
                  key={arena.id} 
                  className="flex items-center justify-between border-b border-foreground/10 py-2 font-mono text-[0.58rem]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="font-bold text-orange">#{rankStr}</span>
                    <span className="font-sans font-medium text-foreground uppercase truncate max-w-[130px]">
                      {arena.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="bg-secondary/40 text-foreground px-1 py-0.5 border border-border/60">
                      {arena.participantCount} DEVS
                    </span>
                    {arena.isPrivate ? (
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
      <div className="pt-4 mt-3 border-t border-dashed border-foreground/10 relative z-10">
        <Link
          href="/billboard"
          className="w-full py-2 bg-orange text-white border-2 border-foreground font-mono text-[0.58rem] font-bold tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-150 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none active:translate-y-0.5 flex items-center justify-center gap-1"
        >
          See More Standings [→]
        </Link>
      </div>

    </div>
  );
}

export default CairoBillboard;
