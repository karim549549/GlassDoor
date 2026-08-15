"use client";

interface ProgressHudProps {
  isGeneralValid: boolean;
  isAccessValid: boolean;
  isTeamValid: boolean;
  isTimelineValid: boolean;
  isRulesValid: boolean;
}

export function ProgressHud({
  isGeneralValid,
  isAccessValid,
  isTeamValid,
  isTimelineValid,
  isRulesValid,
}: ProgressHudProps) {
  const completedCount = [isGeneralValid, isAccessValid, isTeamValid, isTimelineValid, isRulesValid].filter(
    Boolean
  ).length;

  return (
    <div className="border-2 border-card/15 bg-foreground text-background p-5 shadow-[4px_4px_0px_0px_var(--foreground)] relative overflow-hidden">
      {/* Visual grids inside HUD */}
      <div className="absolute inset-1 border border-background/10 pointer-events-none" />

      <span className="font-mono text-[0.48rem] text-orange uppercase tracking-[0.25em] font-bold block mb-1">
        [PROGRESS REGISTER HUD]
      </span>
      <h3 className="font-display italic text-lg uppercase tracking-tight text-background border-b border-background/15 pb-2.5 mb-4">
        Arena Specifications
      </h3>

      {/* Section checklist */}
      <ul className="space-y-3 font-mono text-[0.62rem] uppercase tracking-wider text-background mb-6">
        <li className="flex items-center justify-between gap-3">
          <span className={isGeneralValid ? "line-through text-background/40" : "font-bold"}>
            01. GENERAL DETAILS
          </span>
          <span className={`font-bold shrink-0 ${isGeneralValid ? "text-orange" : "text-background/30"}`}>
            {isGeneralValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isAccessValid ? "line-through text-background/40" : "font-bold"}>
            02. ACCESS SECURITY
          </span>
          <span className={`font-bold shrink-0 ${isAccessValid ? "text-orange" : "text-background/30"}`}>
            {isAccessValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isTeamValid ? "line-through text-background/40" : "font-bold"}>
            03. TEAM LIMITS
          </span>
          <span className={`font-bold shrink-0 ${isTeamValid ? "text-orange" : "text-background/30"}`}>
            {isTeamValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isTimelineValid ? "line-through text-background/40" : "font-bold"}>
            04. RUN TIMELINE
          </span>
          <span className={`font-bold shrink-0 ${isTimelineValid ? "text-orange" : "text-background/30"}`}>
            {isTimelineValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isRulesValid ? "line-through text-background/40" : "font-bold"}>
            05. RULES & LAWS
          </span>
          <span className={`font-bold shrink-0 ${isRulesValid ? "text-orange" : "text-background/30"}`}>
            {isRulesValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
      </ul>

      {/* Progress bar info */}
      <div className="border-t border-background/15 pt-3.5 mt-4 flex justify-between items-center text-[0.55rem] font-mono font-bold tracking-widest text-background">
        <span>COMPLETION RATIO:</span>
        <span className="text-orange">{completedCount} / 5 SECS</span>
      </div>
      <div className="w-full bg-card/10 h-1.5 border border-card/20 mt-2 relative">
        <div
          className="bg-orange h-full transition-all duration-300"
          style={{ width: `${(completedCount / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressHud;
