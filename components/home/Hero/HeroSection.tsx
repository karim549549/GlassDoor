import type { Company } from "@/lib/companies/types";
import { HeroMasthead } from "./HeroMasthead";
import { HeroCoverNotes } from "./HeroCoverNotes";
import { HeroHeadline } from "./HeroHeadline";
import { SearchBox } from "./Search/SearchBox";

interface HeroSectionProps {
  initialCompanies: Company[];
}

export function HeroSection({ initialCompanies }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-background"
      style={{ height: "calc(100svh - 88px)", minHeight: 680, maxHeight: 960 }}
    >
      <HeroMasthead />
      <HeroCoverNotes />

      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "40%", width: "min(560px, 68%)", zIndex: 20 }}
      >
        <SearchBox initialCompanies={initialCompanies} />
      </div>

      <HeroHeadline />
    </section>
  );
}
