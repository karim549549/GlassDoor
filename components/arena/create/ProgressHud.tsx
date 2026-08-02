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
    <div className="border-2 border-[#FAF8F5]/15 bg-[#0E0E0D] text-[#F1EFE9] p-5 shadow-[4px_4px_0px_0px_#0E0E0D] relative overflow-hidden">
      {/* Visual grids inside HUD */}
      <div className="absolute inset-1 border border-[#F1EFE9]/10 pointer-events-none" />

      <span className="font-mono text-[0.48rem] text-orange uppercase tracking-[0.25em] font-bold block mb-1">
        [PROGRESS REGISTER HUD]
      </span>
      <h3 className="font-display italic text-lg uppercase tracking-tight text-[#F1EFE9] border-b border-[#F1EFE9]/15 pb-2.5 mb-4">
        Arena Specifications
      </h3>

      {/* Section checklist */}
      <ul className="space-y-3 font-mono text-[0.62rem] uppercase tracking-wider text-[#F1EFE9] mb-6">
        <li className="flex items-center justify-between gap-3">
          <span className={isGeneralValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
            01. GENERAL DETAILS
          </span>
          <span className={`font-bold shrink-0 ${isGeneralValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
            {isGeneralValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isAccessValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
            02. ACCESS SECURITY
          </span>
          <span className={`font-bold shrink-0 ${isAccessValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
            {isAccessValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isTeamValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
            03. TEAM LIMITS
          </span>
          <span className={`font-bold shrink-0 ${isTeamValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
            {isTeamValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isTimelineValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
            04. RUN TIMELINE
          </span>
          <span className={`font-bold shrink-0 ${isTimelineValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
            {isTimelineValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className={isRulesValid ? "line-through text-[#F1EFE9]/40" : "font-bold"}>
            05. RULES & LAWS
          </span>
          <span className={`font-bold shrink-0 ${isRulesValid ? "text-orange" : "text-[#F1EFE9]/30"}`}>
            {isRulesValid ? "[✓] DONE" : "[ ] PENDING"}
          </span>
        </li>
      </ul>

      {/* Progress bar info */}
      <div className="border-t border-[#F1EFE9]/15 pt-3.5 mt-4 flex justify-between items-center text-[0.55rem] font-mono font-bold tracking-widest text-[#F1EFE9]">
        <span>COMPLETION RATIO:</span>
        <span className="text-orange">{completedCount} / 5 SECS</span>
      </div>
      <div className="w-full bg-[#FAF8F5]/10 h-1.5 border border-[#FAF8F5]/20 mt-2 relative">
        <div
          className="bg-orange h-full transition-all duration-300"
          style={{ width: `${(completedCount / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressHud;
