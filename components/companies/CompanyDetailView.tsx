"use client";

import React from "react";
import Link from "next/link";
import { Building2, Code2, Trophy, ArrowRight, Plus } from "lucide-react";
import type { Company } from "@/lib/companies/types";
import { CompanyHeroHeader } from "./CompanyHeroHeader";

interface CompanyDetailViewProps {
  company: Company;
}

export function CompanyDetailView({ company }: CompanyDetailViewProps) {
  const techStack = company.techStack ?? ["TypeScript", "Next.js", "PostgreSQL", "TailwindCSS"];

  return (
    <div className="w-full flex flex-col items-center">
      <CompanyHeroHeader company={company} />

      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Column (8 cols): About & Active Challenges */}
          <div className="lg:col-span-8 space-y-8 text-left">
            {/* About Box */}
            <div className="border-2 border-foreground bg-card p-6">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/40">
                <Building2 className="h-4 w-4 text-orange" />
                <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">
                  About {company.name}
                </h2>
              </div>
              <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                {company.bio ??
                  company.description ??
                  `${company.name} is an active technology employer in Egypt hosting competitive engineering arenas, take-home evaluation challenges, and hiring sprints on Devs Arena.`}
              </p>
            </div>

            {/* Hosted Arenas & Sprints */}
            <div className="border-2 border-foreground bg-card p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-orange" />
                  <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">
                    Hosted Arenas & Hiring Sprints
                  </h2>
                </div>
                <Link
                  href="/arena/create"
                  className="font-mono text-[0.6rem] text-orange hover:underline uppercase flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Host New Arena
                </Link>
              </div>

              <div className="border border-dashed border-border p-8 text-center bg-card/20">
                <p className="font-mono text-xs text-muted-foreground uppercase">
                  No active public arenas currently open for this company.
                </p>
                <div className="mt-4">
                  <Link
                    href="/arena"
                    className="inline-flex items-center gap-2 font-mono text-xs text-foreground hover:text-orange uppercase tracking-wider border border-border px-4 py-2 hover:border-foreground transition-colors"
                  >
                    Browse All Active Arenas <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Tech Stack & Company Info */}
          <div className="lg:col-span-4 space-y-6 text-left">
            {/* Tech Stack */}
            <div className="border-2 border-foreground bg-card p-6">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/40">
                <Code2 className="h-4 w-4 text-orange" />
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                  Primary Tech Stack
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[0.65rem] uppercase px-2.5 py-1 bg-muted text-foreground border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Sourcing Overview */}
            <div className="border-2 border-foreground bg-card p-6">
              <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground mb-3 pb-2 border-b border-border/40">
                Talent Sourcing
              </h3>
              <p className="font-mono text-[0.65rem] text-muted-foreground uppercase leading-relaxed mb-4">
                Are you an engineering recruiter at {company.name}? Host a customized arena to evaluate real candidate code submissions.
              </p>
              <Link
                href="/arena/create"
                className="w-full text-center block bg-foreground text-background hover:bg-orange hover:text-foreground font-mono text-[0.65rem] uppercase font-bold py-3 tracking-wider transition-colors border-2 border-foreground"
              >
                Launch Hiring Arena
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailView;
