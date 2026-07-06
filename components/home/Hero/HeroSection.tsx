import type { Company } from "@/lib/companies/types";
import { HeroMasthead } from "./HeroMasthead";
import { HeroCoverNotes } from "./HeroCoverNotes";
import { HeroHeadline } from "./HeroHeadline";
import { SearchBox } from "./Search/SearchBox";
import Link from "next/link";

interface HeroSectionProps {
  initialCompanies: Company[];
}

export function HeroSection({ initialCompanies }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-border"
      style={{ height: "calc(100svh - 88px)", minHeight: 680, maxHeight: 960 }}
    >
      <HeroMasthead />
      <HeroCoverNotes />

      {/* Center Cluster — Search + secondary Context CTA */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
        style={{ top: "40%", width: "min(560px, 68%)", zIndex: 20 }}
      >
        {/* Micro label above search */}
        <div className="font-mono text-[0.48rem] uppercase tracking-[0.28em] text-muted-foreground mb-3 text-center">
          Search any company
        </div>

        <SearchBox initialCompanies={initialCompanies} />

        {/* Divider + Context CTA below */}
        <div className="flex items-center gap-4 mt-5 w-full">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[0.48rem] uppercase tracking-[0.24em] text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Link
          href="/context"
          className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.22em] border border-border px-5 py-2.5 hover:border-foreground hover:text-foreground text-muted-foreground transition-colors flex items-center gap-2.5"
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
          Join a live context arena
        </Link>
      </div>

      <HeroHeadline />
    </section>
  );
}
