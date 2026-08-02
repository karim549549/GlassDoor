import React from "react";
import { Calendar } from "lucide-react";
import { MONTHS, YEARS } from "@/lib/companies/salaryModalOptions";

export interface SalaryModalDurationValue {
  isCurrent: boolean;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

interface SalaryModalDurationSectionProps {
  value: SalaryModalDurationValue;
  onChange: (patch: Partial<SalaryModalDurationValue>) => void;
}

export function SalaryModalDurationSection({ value, onChange }: SalaryModalDurationSectionProps) {
  const { isCurrent, startMonth, startYear, endMonth, endYear } = value;

  return (
    <div>
      <div className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
        <Calendar className="h-3 w-3" /> Work Duration
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="isCurrent"
          checked={isCurrent}
          onChange={(e) => onChange({ isCurrent: e.target.checked })}
          className="h-4 w-4 cursor-pointer accent-[#0E0E0D]"
        />
        <label htmlFor="isCurrent" className="font-mono text-[0.6rem] uppercase tracking-wider cursor-pointer font-bold text-[#0E0E0D]">
          I currently work here
        </label>
      </div>

      <div className={`grid gap-4 ${isCurrent ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        <div className="space-y-1.5">
          <label htmlFor="salary-start-month" className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
            Start Date
          </label>
          <div className="flex gap-2">
            <select
              id="salary-start-month"
              aria-label="Start month"
              value={startMonth}
              onChange={(e) => onChange({ startMonth: e.target.value })}
              className="flex-1 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] uppercase cursor-pointer"
            >
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              aria-label="Start year"
              value={startYear}
              onChange={(e) => onChange({ startYear: e.target.value })}
              className="w-24 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] cursor-pointer"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {!isCurrent && (
          <div className="space-y-1.5">
            <label htmlFor="salary-end-month" className="font-mono text-[0.55rem] uppercase tracking-wider text-[#0E0E0D]/60 font-bold block">
              End Date
            </label>
            <div className="flex gap-2">
              <select
                id="salary-end-month"
                aria-label="End month"
                value={endMonth}
                onChange={(e) => onChange({ endMonth: e.target.value })}
                className="flex-1 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] uppercase cursor-pointer"
              >
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                aria-label="End year"
                value={endYear}
                onChange={(e) => onChange({ endYear: e.target.value })}
                className="w-24 border border-[#0E0E0D]/25 focus:border-[#0E0E0D] p-2.5 bg-[#F1EFE9] outline-none font-mono text-[0.6rem] cursor-pointer"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalaryModalDurationSection;
