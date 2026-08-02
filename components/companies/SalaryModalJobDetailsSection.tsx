import React from "react";
import { Briefcase } from "lucide-react";
import { SENIORITIES } from "@/lib/companies/salaryModalOptions";

interface SalaryModalJobDetailsSectionProps {
  position: string;
  onPositionChange: (value: string) => void;
  seniority: string;
  onSeniorityChange: (value: string) => void;
}

export function SalaryModalJobDetailsSection({
  position,
  onPositionChange,
  seniority,
  onSeniorityChange,
}: SalaryModalJobDetailsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
        <Briefcase className="h-3 w-3" /> Job Details
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="salary-position" className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
            Position / Job Title *
          </label>
          <input
            id="salary-position"
            type="text"
            placeholder="e.g. Backend Engineer"
            required
            value={position}
            onChange={(e) => onPositionChange(e.target.value)}
            className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] uppercase bg-transparent outline-none placeholder:text-[#0E0E0D]/30 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="salary-seniority" className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
            Seniority Level *
          </label>
          <select
            id="salary-seniority"
            value={seniority}
            onChange={(e) => onSeniorityChange(e.target.value)}
            className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] bg-[#F1EFE9] outline-none uppercase cursor-pointer transition-colors"
          >
            {SENIORITIES.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default SalaryModalJobDetailsSection;
