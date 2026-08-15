"use client";

import React, { useState } from "react";
import { Zap, Activity, Compass, Cpu } from "lucide-react";
import { HUDCornerReticle } from "./HUDCornerReticle";

const DOMAINS = [
  { id: "BACKEND_DISTRIBUTED", name: "Backend & Distributed Systems", base: 1840, rd: 42, activeDevs: 412 },
  { id: "AI_MACHINE_LEARNING", name: "AI & Machine Learning", base: 1910, rd: 38, activeDevs: 284 },
  { id: "FULL_STACK_WEB", name: "Full-Stack Web Architecture", base: 1720, rd: 48, activeDevs: 620 },
  { id: "CYBERSECURITY_ETHICAL_HACKING", name: "Cybersecurity & Exploits", base: 1890, rd: 35, activeDevs: 195 },
  { id: "SYSTEMS_DEV_OPS", name: "Systems & Cloud Infra", base: 1780, rd: 44, activeDevs: 260 },
  { id: "DATA_ENGINEERING", name: "Data Engineering & Pipelines", base: 1690, rd: 52, activeDevs: 210 },
];

export function GlickoLedgerExplorer() {
  const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0]);

  return (
    <section className="relative z-20 w-full py-24 md:py-36 px-6 md:px-12 bg-background border-b border-foreground/20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground/15 pb-6">
          <div className="space-y-2">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.25em] text-orange font-bold block">
              [05 / MATHEMATICAL FOUNDATION]
            </span>
            <h2 className="font-display italic text-[clamp(2rem,4vw,3.5rem)] leading-none uppercase font-normal text-foreground">
              Glicko-2 Multi-Domain Ledger
            </h2>
            <p className="font-sans text-sm text-foreground/80 max-w-xl">
              Skills are domain-isolated. An expert in Distributed Systems starts fresh in Machine Learning — ensuring authentic specialization.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[0.58rem] bg-card px-3 py-1.5 border border-foreground/20 text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-orange" />
            <span>BATCH PERIOD: 14 DAYS</span>
          </div>
        </div>

        {/* Domain Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (6 cols): Domain Selection Grid */}
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-wider block font-bold">
              SELECT TECHNICAL DOMAIN TO AUDIT:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain)}
                  className={`p-4 border-2 text-left transition-all font-mono text-xs ${
                    selectedDomain.id === domain.id
                      ? "border-foreground bg-foreground text-background shadow-[3px_3px_0px_0px_var(--orange)]"
                      : "border-foreground/20 bg-card hover:border-foreground/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.52rem] text-orange font-bold">DOMAIN</span>
                    <span className="text-[0.52rem] text-muted-foreground">{domain.activeDevs} DEVS</span>
                  </div>
                  <span className="font-bold block text-[0.75rem] leading-snug">{domain.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column (6 cols): Domain Mathematical Radar */}
          <div className="lg:col-span-6">
            <HUDCornerReticle
              label={`DOMAIN TELEMETRY // ${selectedDomain.id}`}
              coordinate="GLICKO-2 MATHEMATICAL CALIBRATION"
              className="h-full border-2 border-foreground bg-white shadow-[6px_6px_0px_0px_var(--foreground)] flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-baseline justify-between p-4 bg-foreground text-background">
                  <div>
                    <span className="font-mono text-[0.52rem] text-background/60 tracking-widest block font-bold">
                      TOP TIER BENCHMARK
                    </span>
                    <span className="font-display italic text-2xl sm:text-3xl text-orange font-bold">
                      {selectedDomain.base} <span className="text-xs font-normal text-background/60">Glicko-2</span>
                    </span>
                  </div>
                  <span className="font-mono text-xs bg-orange text-card px-2.5 py-1 font-bold">
                    GRANDMASTER
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[0.6rem] font-bold">
                      <span>RATING DEVIATION (UNCERTAINTY):</span>
                      <span className="text-orange">&plusmn;{selectedDomain.rd} RD</span>
                    </div>
                    <div className="w-full bg-secondary h-2 border border-foreground/15">
                      <div className="bg-orange h-full w-[84%]" />
                    </div>
                    <span className="text-[0.5rem] text-muted-foreground">
                      Lower RD indicates higher statistical certainty based on recent verified sprints.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-secondary/30 border border-foreground/15">
                      <span className="text-[0.5rem] text-muted-foreground font-bold block">
                        VOLATILITY (&sigma;):
                      </span>
                      <span className="font-bold text-sm text-foreground">0.058</span>
                    </div>
                    <div className="p-3 bg-secondary/30 border border-foreground/15">
                      <span className="text-[0.5rem] text-muted-foreground font-bold block">
                        ANTI-FARMING PENALTY:
                      </span>
                      <span className="font-bold text-sm text-green-700">ENFORCED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-foreground/10 flex items-center justify-between font-mono text-[0.52rem] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-orange" />
                  <span>CALCULATED VIA GLICKMAN (2001) EQUATIONS</span>
                </div>
                <span className="text-orange font-bold">[✓] ACTIVE</span>
              </div>
            </HUDCornerReticle>
          </div>
        </div>
      </div>
    </section>
  );
}
