import React from "react";

interface ArenaStatsCardProps {
  rating: number;
}

/** Memoized: this card's numbers are placeholders derived only from `rating` -
 * no need to re-render it when unrelated ProfileView state (e.g. avatar/cover
 * updates) changes. */
export const ArenaStatsCard = React.memo(function ArenaStatsCard({ rating }: ArenaStatsCardProps) {
  return (
    <div className="relative overflow-hidden border border-foreground bg-card p-6 font-mono text-[0.65rem] uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(14,14,13,0.1)] flex flex-col justify-between gap-4">
      {/* Placeholder disclosure: this section's numbers are not backed by real data yet */}
      <div className="absolute inset-0 z-10 bg-card/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 text-center p-6">
        <span className="font-mono text-[0.65rem] font-black uppercase tracking-widest text-orange">Coming Soon</span>
        <span className="font-mono text-[0.5rem] text-muted-foreground uppercase tracking-wider max-w-[200px] leading-relaxed">
          Arena stats will go live once contests launch. Numbers shown are placeholders.
        </span>
      </div>
      <div className="border-b border-foreground/10 pb-2">
        <h3 className="font-bold text-[0.8rem] text-foreground">Arena Stats</h3>
      </div>

      {/* distributed metrics as vertical brutalist blocks */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div className="p-3 bg-foreground text-background flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
          <span className="text-background/50 text-[0.52rem] tracking-widest font-black">CURRENT RATING</span>
          <span className="text-[1.1rem] font-bold text-orange mt-1">{rating || 0}</span>
        </div>

        <div className="p-3 border border-foreground bg-card flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
          <span className="text-foreground/50 text-[0.52rem] tracking-widest font-black">MAX RATING</span>
          <span className="text-[1.1rem] font-bold text-foreground mt-1">{rating ? rating + 140 : 0}</span>
        </div>

        <div className="p-3 border border-foreground bg-card flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
          <span className="text-foreground/50 text-[0.52rem] tracking-widest font-black">ARENA RANK</span>
          <span className="text-[0.7rem] font-bold text-foreground mt-1">TOP 12% EGYPT</span>
        </div>

        <div className="p-3 border border-foreground bg-card flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
          <span className="text-foreground/50 text-[0.52rem] tracking-widest font-black">PROBLEMS COMPLETED</span>
          <span className="text-[1.1rem] font-bold text-foreground mt-1">195</span>
        </div>

        <div className="p-3 border border-foreground bg-card flex flex-col justify-center shadow-[2px_2px_0px_0px_rgba(14,14,13,0.08)]">
          <span className="text-foreground/50 text-[0.52rem] tracking-widest font-black">ACTIVE STREAK</span>
          <span className="text-[0.7rem] font-bold text-foreground mt-1">14 DAYS MAX</span>
        </div>
      </div>
    </div>
  );
});
