"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Code2, Building2, Trophy, CheckCircle2, ArrowRight, Shield, Zap, Search } from "lucide-react";
import { HUDCornerReticle } from "./HUDCornerReticle";

type PerspectiveRole = "developer" | "recruiter" | "organizer";

export function ThreeSidedPerspective() {
  const [activeRole, setActiveRole] = useState<PerspectiveRole>("developer");

  return (
    <section className="relative z-20 w-full py-24 md:py-36 px-6 md:px-12 bg-background border-b border-foreground/20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground/15 pb-6">
          <div className="space-y-2">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.25em] text-orange font-bold block">
              [03 / THREE-SIDED PLATFORM ARCHITECTURE]
            </span>
            <h2 className="font-display italic text-[clamp(2rem,4vw,3.5rem)] leading-none uppercase font-normal text-foreground">
              Engineered For The Full Ecosystem
            </h2>
          </div>

          {/* Role Toggle Selector */}
          <div className="flex items-center gap-1 p-1 bg-card border-2 border-foreground shadow-[3px_3px_0px_0px_var(--foreground)] font-mono text-[0.62rem] uppercase tracking-wider font-bold">
            <button
              onClick={() => setActiveRole("developer")}
              className={`px-4 py-2 flex items-center gap-2 transition-all ${
                activeRole === "developer"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>For Developers</span>
            </button>
            <button
              onClick={() => setActiveRole("recruiter")}
              className={`px-4 py-2 flex items-center gap-2 transition-all ${
                activeRole === "recruiter"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>For Recruiters</span>
            </button>
            <button
              onClick={() => setActiveRole("organizer")}
              className={`px-4 py-2 flex items-center gap-2 transition-all ${
                activeRole === "organizer"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>For Organizers</span>
            </button>
          </div>
        </div>

        {/* Dynamic Role Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (7 cols): Narrative & Capabilities */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {activeRole === "developer" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <span className="font-mono text-xs font-bold text-orange uppercase tracking-widest block">
                    &gt; THE DEVELOPER ENGINE
                  </span>
                  <h3 className="font-display italic text-2xl sm:text-3xl text-foreground font-bold uppercase">
                    Stop submitting ignored resumes. Build verified proof.
                  </h3>
                  <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                    Join live timed sprint battles (REP, LIVE, and ARENA formats). Solve real engineering challenges, collaborate with squad peers, and automatically establish domain Glicko-2 ratings on an append-only cryptographic ledger.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border border-foreground/15 bg-card/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-orange" />
                      <span>Skip Technical Screenings</span>
                    </div>
                    <p className="font-mono text-[0.58rem] text-muted-foreground leading-relaxed">
                      Proof Packets are recognized by Egyptian enterprise employers as verified technical competence.
                    </p>
                  </div>

                  <div className="p-4 border border-foreground/15 bg-card/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Zap className="w-4 h-4 text-orange" />
                      <span>Glicko-2 Domain Ratings</span>
                    </div>
                    <p className="font-mono text-[0.58rem] text-muted-foreground leading-relaxed">
                      Calibrated across 9 tech domains (Backend, Full-Stack, AI, Systems) with strict anti-farming mathematics.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/arena"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-card font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_var(--foreground)] hover:bg-foreground hover:text-background transition-colors"
                  >
                    <span>ENTER SPRINT ARENAS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {activeRole === "recruiter" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <span className="font-mono text-xs font-bold text-orange uppercase tracking-widest block">
                    &gt; THE RECRUITER &amp; EMPLOYER PIPELINE
                  </span>
                  <h3 className="font-display italic text-2xl sm:text-3xl text-foreground font-bold uppercase">
                    Zero guesswork. Hire developers by actual code.
                  </h3>
                  <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                    Filter thousands of Egyptian software engineers by verified Glicko-2 ratings, domain specializations, and Egyptian governorates. Inspect compiled code, judge rubrics, and video defenses before scheduling an interview.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border border-foreground/15 bg-card/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Search className="w-4 h-4 text-orange" />
                      <span>Pre-Evaluated Candidates</span>
                    </div>
                    <p className="font-mono text-[0.58rem] text-muted-foreground leading-relaxed">
                      Every candidate profile includes rubric scorecards evaluated by named senior industry judges.
                    </p>
                  </div>

                  <div className="p-4 border border-foreground/15 bg-card/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Shield className="w-4 h-4 text-orange" />
                      <span>1-Click Contact Export</span>
                    </div>
                    <p className="font-mono text-[0.58rem] text-muted-foreground leading-relaxed">
                      Export candidate shortlists directly to CSV with verified GitHub commits and Proof Packet slugs.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/recruiter"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_var(--orange)] hover:bg-orange transition-colors"
                  >
                    <span>OPEN RECRUITER PIPELINE</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {activeRole === "organizer" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <span className="font-mono text-xs font-bold text-orange uppercase tracking-widest block">
                    &gt; THE ORGANIZER &amp; HACKATHON SUITE
                  </span>
                  <h3 className="font-display italic text-2xl sm:text-3xl text-foreground font-bold uppercase">
                    Host branded hackathons and hiring challenges.
                  </h3>
                  <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                    Deploy custom corporate sprint arenas with automated submission ingest, rubric criteria builders, conflict-of-interest arbitration triggers, and live spectator leaderboards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border border-foreground/15 bg-card/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Trophy className="w-4 h-4 text-orange" />
                      <span>Non-Custodial Prize Pools</span>
                    </div>
                    <p className="font-mono text-[0.58rem] text-muted-foreground leading-relaxed">
                      Define multi-currency prize tiers (EGP, USD) with automated leaderboard publication.
                    </p>
                  </div>

                  <div className="p-4 border border-foreground/15 bg-card/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-orange" />
                      <span>Conflict-of-Interest Guard</span>
                    </div>
                    <p className="font-mono text-[0.58rem] text-muted-foreground leading-relaxed">
                      Database-level triggers guarantee judges cannot score their own team or employer.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/arena/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-card font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_var(--foreground)] hover:bg-foreground hover:text-background transition-colors"
                  >
                    <span>HOST AN ARENA</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Interactive HUD Telemetry Card */}
          <div className="lg:col-span-5">
            <HUDCornerReticle
              label={`LIVE PREVIEW // ${activeRole.toUpperCase()}`}
              coordinate="30.0444° N"
              className="h-full flex flex-col justify-between border-2 border-foreground shadow-[5px_5px_0px_0px_var(--foreground)]"
            >
              {activeRole === "developer" && (
                <div className="space-y-4">
                  <div className="p-3 bg-foreground text-background flex items-center justify-between">
                    <span className="font-mono text-[0.6rem] font-bold">CONTESTANT TELEMETRY</span>
                    <span className="font-mono text-[0.55rem] text-orange">ACTIVE SPRINT</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Backend Distributed</span>
                      <span className="text-orange">1840 Glicko-2</span>
                    </div>
                    <div className="w-full bg-secondary h-2 border border-foreground/15 overflow-hidden">
                      <div className="bg-orange h-full w-[78%]" />
                    </div>
                    <span className="text-[0.52rem] text-muted-foreground block">
                      UNCERTAINTY: &plusmn;42 RD &bull; TOP 4% EGYPT
                    </span>
                  </div>
                  <div className="p-3 border border-dashed border-foreground/30 bg-secondary/30 space-y-1">
                    <span className="font-mono text-[0.55rem] font-bold text-foreground block">
                      LAST COMPLETED SPRINT
                    </span>
                    <p className="font-sans text-xs text-foreground/80">
                      Cairo Microservices Battle · Score: 9.4 / 10 · Proof #cairo-94a2
                    </p>
                  </div>
                </div>
              )}

              {activeRole === "recruiter" && (
                <div className="space-y-4">
                  <div className="p-3 bg-foreground text-background flex items-center justify-between">
                    <span className="font-mono text-[0.6rem] font-bold">PIPELINE QUERY CONSOLE</span>
                    <span className="font-mono text-[0.55rem] text-orange">68 MATCHES</span>
                  </div>
                  <div className="space-y-2 text-[0.6rem] font-mono">
                    <div className="p-2 bg-secondary border border-foreground/10 flex justify-between">
                      <span>DOMAIN: FULL_STACK_WEB</span>
                      <span className="font-bold text-foreground">&gt; 1700 RATING</span>
                    </div>
                    <div className="p-2 bg-secondary border border-foreground/10 flex justify-between">
                      <span>LOCATION: CAIRO / GIZA</span>
                      <span className="font-bold text-orange">ACTIVELY LOOKING</span>
                    </div>
                  </div>
                  <div className="p-3 border border-foreground/20 bg-card space-y-1">
                    <span className="text-[0.52rem] text-muted-foreground uppercase font-bold block">
                      VERIFIED CANDIDATE PREVIEW
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground block">
                      Omar H. (@omar_dev) · 1920 Glicko-2
                    </span>
                    <span className="text-[0.55rem] text-green-700 font-bold block">
                      [✓] 3 VERIFIED PROOF PACKETS &bull; VIDEO DEFENSE AUDITED
                    </span>
                  </div>
                </div>
              )}

              {activeRole === "organizer" && (
                <div className="space-y-4">
                  <div className="p-3 bg-foreground text-background flex items-center justify-between">
                    <span className="font-mono text-[0.6rem] font-bold">ARENA ESCROW &amp; RUBRIC</span>
                    <span className="font-mono text-[0.55rem] text-orange">PUBLISHED</span>
                  </div>
                  <div className="space-y-2 font-mono text-[0.6rem]">
                    <div className="flex justify-between border-b border-foreground/10 pb-1">
                      <span>PRIZE POOL:</span>
                      <span className="font-bold text-foreground">150,000 EGP</span>
                    </div>
                    <div className="flex justify-between border-b border-foreground/10 pb-1">
                      <span>RUBRIC CRITERIA:</span>
                      <span className="font-bold text-foreground">5 EVALUATION METRICS</span>
                    </div>
                    <div className="flex justify-between border-b border-foreground/10 pb-1">
                      <span>NAMED JUDGES:</span>
                      <span className="font-bold text-foreground">4 VERIFIED JUDGES</span>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/40 border border-foreground/15 text-[0.55rem] font-mono text-muted-foreground">
                    ANTI-CHEAT TRIGGER: COI-PROTECT-ON-SUBMIT ACTIVE
                  </div>
                </div>
              )}

              <div className="mt-6 pt-3 border-t border-foreground/10 text-right">
                <span className="font-mono text-[0.5rem] text-muted-foreground tracking-widest">
                  DEVS-ARENA-CORE // REV-2026.08
                </span>
              </div>
            </HUDCornerReticle>
          </div>
        </div>
      </div>
    </section>
  );
}
