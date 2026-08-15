import React from "react";
import Link from "next/link";
import { Building2, MapPin, Globe, ShieldCheck, Plus } from "lucide-react";
import type { Company } from "@/lib/companies/types";

interface CompanyHeroHeaderProps {
  company: Company;
}

/**
 * Company profile header: Monogram/logo, name, industry, verified badge, description,
 * website link, and "Host an Arena" CTA.
 */
function CompanyHeroHeaderImpl({ company }: CompanyHeroHeaderProps) {
  const industry = company.industry ?? company.sector ?? "Technology";
  const location = company.location ?? "Cairo, Egypt";

  return (
    <div className="relative w-full h-[320px] md:h-[380px] bg-foreground text-background flex items-end border-b border-foreground">
      {/* Abstract Blueprint Grid Cover Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cover-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--background)" strokeWidth="0.5" />
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
          <div className="h-20 w-20 md:h-24 md:w-24 bg-background text-foreground border-2 border-background flex items-center justify-center font-display text-[2rem] md:text-[2.5rem] font-bold shrink-0">
            {company.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl md:text-5xl font-medium tracking-tight">
                {company.name}
              </h1>
              <span className="font-mono text-[0.6rem] border border-background/30 px-2 py-0.5 uppercase tracking-wider text-muted-foreground bg-background/5">
                {industry}
              </span>
              {company.isVerified && (
                <span className="inline-flex items-center gap-1 font-mono text-[0.55rem] text-orange bg-orange/10 border border-orange/30 px-2 py-0.5 uppercase">
                  <ShieldCheck className="h-3 w-3" /> Verified Employer
                </span>
              )}
            </div>

            <p className="font-mono text-[0.65rem] md:text-[0.75rem] text-muted-foreground uppercase mt-2 tracking-widest leading-relaxed max-w-xl">
              {company.description ??
                "Verified Egyptian tech partner hosting competitive coding arenas and engineering hiring sprints."}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-[0.55rem] font-mono uppercase tracking-wider text-muted-foreground/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange" /> {location}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {industry}
              </span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-orange transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" /> {company.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Row: Host an Arena CTA */}
        <div className="flex items-center gap-4 shrink-0 self-start md:self-end">
          <Link
            href="/arena/create"
            className="bg-background text-foreground hover:bg-orange hover:text-foreground border-2 border-background px-5 py-4 font-mono text-[0.65rem] font-bold uppercase tracking-wider transition-colors rounded-none flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Host an Arena
          </Link>
        </div>
      </div>
    </div>
  );
}

export const CompanyHeroHeader = React.memo(CompanyHeroHeaderImpl);
export default CompanyHeroHeader;
