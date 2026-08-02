import React from "react";
import type { Role } from "@/lib/companies/types";

interface RolePositionSelectorProps {
  roles: Role[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Left-column list of job positions used to filter the salary trend chart. */
function RolePositionSelectorImpl({ roles, activeIndex, onSelect }: RolePositionSelectorProps) {
  return (
    <div className="col-span-1 flex flex-col gap-2.5">
      <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground mb-1 block">
        Select Position ({roles.length})
      </span>
      {roles.map((role, idx) => (
        <button
          key={role.title}
          onClick={() => onSelect(idx)}
          className={`w-full text-left p-3.5 border transition-all duration-150 cursor-pointer font-mono text-[0.65rem] uppercase tracking-wider flex items-center justify-between gap-3 ${
            activeIndex === idx
              ? "bg-[#0E0E0D] text-[#F1EFE9] border-[#0E0E0D]"
              : "bg-[#F1EFE9] border-border text-foreground hover:border-[#0E0E0D]"
          }`}
        >
          <span className="font-bold truncate">{role.title}</span>
          <span className="opacity-60 text-[0.55rem] shrink-0">
            {role.exp}
          </span>
        </button>
      ))}
    </div>
  );
}

export const RolePositionSelector = React.memo(RolePositionSelectorImpl);
export default RolePositionSelector;
