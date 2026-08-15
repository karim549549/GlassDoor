import React from "react";

/** Memoized: fully static placeholder content (no dynamic profile data), so it
 * never needs to re-render when ProfileView's `profile` state changes. */
export const ArenaPerformanceRecord = React.memo(function ArenaPerformanceRecord() {
  return (
    <div className="relative overflow-hidden border border-foreground bg-card p-6 font-mono text-[0.65rem] uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(14,14,13,0.1)] space-y-6">
      {/* Placeholder disclosure: this section's charts/results are not backed by real data yet */}
      <div className="absolute inset-0 z-10 bg-card/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 text-center p-6">
        <span className="font-mono text-[0.7rem] font-black uppercase tracking-widest text-orange">Coming Soon</span>
        <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-wider max-w-[280px] leading-relaxed">
          Contest history, rating trends, and solve activity will appear here once Arena contests launch. Data shown is a placeholder preview.
        </span>
      </div>
      <div className="border-b border-foreground/10 pb-2">
        <h3 className="font-bold text-[0.8rem] text-foreground">Arena Performance Record</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SVG Rating Trend line chart */}
        <div className="space-y-2">
          <span className="font-bold text-foreground block">Rating Trend (Contest History):</span>
          <div className="w-full h-40 border border-foreground/25 bg-background/40 relative overflow-hidden flex items-center justify-center">
            {/* Brutalist Grid Paper Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:16px_16px]" />

            {/* SVG Sparkline */}
            <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 5,90 L 25,60 L 45,75 L 65,40 L 85,45 L 95,30" fill="none" stroke="var(--foreground)" strokeWidth="1.5" />
              <path
                d="M 5,90 L 25,60 L 45,75 L 65,40 L 85,45 L 95,30 L 95,100 L 5,100 Z"
                fill="url(#orange-gradient)"
                opacity="0.1"
              />

              {/* Dots */}
              <circle cx="5" cy="90" r="1.5" fill="var(--foreground)" />
              <circle cx="25" cy="60" r="1.5" fill="var(--foreground)" />
              <circle cx="45" cy="75" r="1.5" fill="var(--foreground)" />
              <circle cx="65" cy="40" r="1.5" fill="var(--foreground)" />
              <circle cx="85" cy="45" r="1.5" fill="var(--foreground)" />
              <circle cx="95" cy="30" r="2" fill="orange" stroke="var(--foreground)" strokeWidth="0.5" />

              <defs>
                <linearGradient id="orange-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="orange" />
                  <stop offset="100%" stopColor="orange" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Legend labels */}
            <span className="absolute top-2 left-2 text-[0.45rem] font-bold text-muted-foreground">MAX rating: 1680</span>
            <span className="absolute bottom-2 right-2 text-[0.45rem] font-bold text-muted-foreground">
              C1  C2  C3  C4  C5  C6
            </span>
          </div>
        </div>

        {/* Solve activity calendar heatmap */}
        <div className="space-y-2">
          <span className="font-bold text-foreground block">Solve Activity Heatmap:</span>
          <div className="w-full h-40 border border-foreground/25 bg-background/40 p-4 flex flex-col justify-between relative overflow-hidden select-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px)] bg-[size:12px_1px]" />

            <div className="space-y-1.5 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="w-6 text-right text-[0.45rem] text-muted-foreground font-black">MON</span>
                <div className="flex gap-1">
                  {"█░░▒▓██░░▒▓██░░▒▓█".split("").map((char, i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 border border-foreground/10 flex items-center justify-center font-sans font-bold text-[0.55rem] ${
                        char === "█"
                          ? "bg-orange text-card"
                          : char === "▓"
                            ? "bg-orange/60 text-card"
                            : char === "▒"
                              ? "bg-orange/30 text-foreground"
                              : "bg-background text-foreground/30"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right text-[0.45rem] text-muted-foreground font-black">WED</span>
                <div className="flex gap-1">
                  {"░▒▓██░░▒▓██░░▒▓██░".split("").map((char, i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 border border-foreground/10 flex items-center justify-center font-sans font-bold text-[0.55rem] ${
                        char === "█"
                          ? "bg-orange text-card"
                          : char === "▓"
                            ? "bg-orange/60 text-card"
                            : char === "▒"
                              ? "bg-orange/30 text-foreground"
                              : "bg-background text-foreground/30"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right text-[0.45rem] text-muted-foreground font-black">FRI</span>
                <div className="flex gap-1">
                  {"▒▓██░░▒▓██░░▒▓██░░".split("").map((char, i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 border border-foreground/10 flex items-center justify-center font-sans font-bold text-[0.55rem] ${
                        char === "█"
                          ? "bg-orange text-card"
                          : char === "▓"
                            ? "bg-orange/60 text-card"
                            : char === "▒"
                              ? "bg-orange/30 text-foreground"
                              : "bg-background text-foreground/30"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[0.45rem] text-muted-foreground flex justify-between items-center pt-2 border-t border-foreground/10">
              <span>Intensity: [ ] Low ➔ [█] High</span>
              <span>Solves last 3 months</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Contests results table */}
      <div className="space-y-3.5 border-t border-foreground/10 pt-4">
        <span className="font-bold text-foreground block">Latest results:</span>
        <div className="overflow-x-auto border border-foreground">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground text-background text-[0.58rem] tracking-widest font-black uppercase">
                <th className="p-3 border-r border-card/10">Context</th>
                <th className="p-3 border-r border-card/10 text-center">Rank</th>
                <th className="p-3 border-r border-card/10 text-center">Points</th>
                <th className="p-3 text-center">Rating Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground bg-card text-[0.58rem]">
              <tr className="hover:bg-foreground/5 transition-colors">
                <td className="p-3 border-r border-foreground font-bold text-foreground">Cairo Web Arena #3</td>
                <td className="p-3 border-r border-foreground text-center font-bold">21/200</td>
                <td className="p-3 border-r border-foreground text-center">450 PTS</td>
                <td className="p-3 text-center font-bold text-green-600">+85 (Expert)</td>
              </tr>
              <tr className="hover:bg-foreground/5 transition-colors">
                <td className="p-3 border-r border-foreground font-bold text-foreground">Alex-JS Tournament</td>
                <td className="p-3 border-r border-foreground text-center font-bold">45/120</td>
                <td className="p-3 border-r border-foreground text-center">300 PTS</td>
                <td className="p-3 text-center font-bold text-accent">-12 (Expert)</td>
              </tr>
              <tr className="hover:bg-foreground/5 transition-colors">
                <td className="p-3 border-r border-foreground font-bold text-foreground">Delta Hackathon</td>
                <td className="p-3 border-r border-foreground text-center font-bold">5/150</td>
                <td className="p-3 border-r border-foreground text-center">900 PTS</td>
                <td className="p-3 text-center font-bold text-green-600">+210 (Specialist)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
