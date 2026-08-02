import React from "react";
import { StarRating } from "./StarRating";

export interface SalaryModalRatingsValue {
  salary: number;
  learning: number;
  vibes: number;
}

interface SalaryModalRatingsSectionProps {
  value: SalaryModalRatingsValue;
  onChange: (patch: Partial<SalaryModalRatingsValue>) => void;
}

export function SalaryModalRatingsSection({ value, onChange }: SalaryModalRatingsSectionProps) {
  return (
    <div>
      <div className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold mb-3 pb-2 border-b border-[#0E0E0D]/20">
        Rate Workplace Environment (1-5 Stars)
      </div>
      <div className="space-y-3">
        <StarRating label="Salary Satisfaction" value={value.salary} onChange={(v) => onChange({ salary: v })} />
        <StarRating label="Learning Curve" value={value.learning} onChange={(v) => onChange({ learning: v })} />
        <StarRating label="Workplace Vibes" value={value.vibes} onChange={(v) => onChange({ vibes: v })} />
      </div>
    </div>
  );
}

export default SalaryModalRatingsSection;
