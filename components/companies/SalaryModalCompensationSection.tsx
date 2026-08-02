import React from "react";
import { Coins } from "lucide-react";

interface SalaryModalCompensationSectionProps {
  salary: string;
  onSalaryChange: (value: string) => void;
}

export function SalaryModalCompensationSection({
  salary,
  onSalaryChange,
}: SalaryModalCompensationSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
        <Coins className="h-3 w-3" /> Compensation
      </div>
      <div className="space-y-1.5">
        <label htmlFor="salary-amount" className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
          Monthly Base Salary (Net EGP) *
        </label>
        <input
          id="salary-amount"
          type="number"
          placeholder="e.g. 25000"
          required
          min={0}
          value={salary}
          onChange={(e) => onSalaryChange(e.target.value)}
          className="w-full border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-3 font-mono text-[0.65rem] bg-transparent outline-none placeholder:text-[#0E0E0D]/30 transition-colors"
        />
      </div>
    </div>
  );
}

export default SalaryModalCompensationSection;
