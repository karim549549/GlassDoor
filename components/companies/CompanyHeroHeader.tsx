import React from "react";
import { Star, Building2, MapPin, Users, Plus } from "lucide-react";
import type { Company } from "@/lib/companies/types";

interface CompanyHeroHeaderProps {
  company: Company;
  onSubmitSalary: () => void;
}

/**
 * Cover banner: logo, name/sector, description, quick-stat row, rating badge,
 * and the entry point into the salary-submission flow.
 */
function CompanyHeroHeaderImpl({ company, onSubmitSalary }: CompanyHeroHeaderProps) {
  return (
    <div className="relative w-full h-[320px] md:h-[380px] bg-[#0E0E0D] text-[#F1EFE9] flex items-end border-b border-[#0E0E0D]">
      {/* Abstract Blueprint Grid Cover Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cover-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#F1EFE9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cover-grid)" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

      {/* Header Metadata Container */}
      <div className="relative w-full max-w-7xl mx-auto px-6 pb-8 md:pb-12 z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="flex items-start md:items-center gap-6">
          {/* Square Initial Logo */}
          <div className="h-20 w-20 md:h-24 md:w-24 bg-[#F1EFE9] text-[#0E0E0D] border-2 border-[#F1EFE9] flex items-center justify-center font-display text-[2rem] md:text-[2.5rem] font-bold shrink-0">
            {company.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl md:text-5xl font-medium tracking-tight">
                {company.name}
              </h1>
              <span className="font-mono text-[0.6rem] border border-[#F1EFE9]/30 px-2 py-0.5 uppercase tracking-wider text-muted-foreground bg-[#F1EFE9]/5">
                {company.sector}
              </span>
            </div>
            <p className="font-mono text-[0.65rem] md:text-[0.75rem] text-muted-foreground uppercase mt-2 tracking-widest leading-relaxed max-w-xl">
              Egyptian operations statistics & community salary indexing portal. Real submission benchmarks.
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-[0.55rem] font-mono uppercase tracking-wider text-muted-foreground/80">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-orange" /> Cairo, Egypt</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {company.sector} sector</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {company.reviews} Submissions</span>
            </div>
          </div>
        </div>

        {/* Action Row: Rating Circle & Submit Button */}
        <div className="flex items-center gap-4 shrink-0 self-start md:self-end">
          {/* Rating Circle Badge */}
          <div className="flex items-center gap-3 bg-[#F1EFE9]/5 border border-[#F1EFE9]/25 p-3">
            <Star className="h-5 w-5 text-orange fill-orange" />
            <div className="flex flex-col text-left">
              <span className="font-mono text-[1.25rem] font-bold leading-none">
                {company.rating}
              </span>
              <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest mt-1">
                Rating score
              </span>
            </div>
          </div>

          {/* Submit Salary Button */}
          <button
            onClick={onSubmitSalary}
            className="bg-[#F1EFE9] text-[#0E0E0D] hover:bg-orange hover:text-[#0E0E0D] border-2 border-[#F1EFE9] px-5 py-4 font-mono text-[0.65rem] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Submit Salary
          </button>
        </div>
      </div>
    </div>
  );
}

export const CompanyHeroHeader = React.memo(CompanyHeroHeaderImpl);
export default CompanyHeroHeader;
