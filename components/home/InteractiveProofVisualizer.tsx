"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, FileCode, Video, Award, ExternalLink, Hash } from "lucide-react";
import { HUDCornerReticle } from "./HUDCornerReticle";

type ProofLayer = "hash" | "rubric" | "git" | "verifier";

export function InteractiveProofVisualizer() {
  const [activeLayer, setActiveLayer] = useState<ProofLayer>("hash");

  return (
    <section className="relative z-20 w-full py-24 md:py-36 px-6 md:px-12 bg-card/20 border-b border-foreground/20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-left space-y-2 max-w-2xl border-b border-foreground/15 pb-6">
          <span className="font-mono text-[0.52rem] uppercase tracking-[0.25em] text-orange font-bold block">
            [04 / CRYPTOGRAPHIC ANATOMY]
          </span>
          <h2 className="font-display italic text-[clamp(2rem,4vw,3.5rem)] leading-none uppercase font-normal text-foreground">
            The Proof Packet Credential
          </h2>
          <p className="font-sans text-sm text-foreground/80 leading-relaxed">
            Every sprint deliverable is sealed into an immutable JSON snapshot, signed with SHA-256, and tied to the developer&apos;s public credential ledger.
          </p>
        </div>

        {/* Interactive 4-Layer Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (5 cols): Layer Selection Navigation */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            <button
              onClick={() => setActiveLayer("hash")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between ${
                activeLayer === "hash"
                  ? "border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-foreground/20 bg-card hover:border-foreground/60 text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Hash className={`w-4 h-4 ${activeLayer === "hash" ? "text-orange" : "text-muted-foreground"}`} />
                <div>
                  <span className="font-bold block text-sm">01 / SHA-256 Canonical Seal</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "hash" ? "text-background/70" : "text-muted-foreground"}`}>
                    Deterministic payload digest
                  </span>
                </div>
              </div>
              <Lock className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("rubric")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between ${
                activeLayer === "rubric"
                  ? "border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-foreground/20 bg-card hover:border-foreground/60 text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className={`w-4 h-4 ${activeLayer === "rubric" ? "text-orange" : "text-muted-foreground"}`} />
                <div>
                  <span className="font-bold block text-sm">02 / Named Judge Rubric</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "rubric" ? "text-background/70" : "text-muted-foreground"}`}>
                    Multi-criteria scored breakdown
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("git")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between ${
                activeLayer === "git"
                  ? "border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-foreground/20 bg-card hover:border-foreground/60 text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCode className={`w-4 h-4 ${activeLayer === "git" ? "text-orange" : "text-muted-foreground"}`} />
                <div>
                  <span className="font-bold block text-sm">03 / GitHub &amp; Video Defense</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "git" ? "text-background/70" : "text-muted-foreground"}`}>
                    Synced commits &amp; architecture video
                  </span>
                </div>
              </div>
              <Video className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("verifier")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between ${
                activeLayer === "verifier"
                  ? "border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-foreground/20 bg-card hover:border-foreground/60 text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-4 h-4 ${activeLayer === "verifier" ? "text-orange" : "text-muted-foreground"}`} />
                <div>
                  <span className="font-bold block text-sm">04 / Public Verification Portal</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "verifier" ? "text-background/70" : "text-muted-foreground"}`}>
                    Instant employer validation url
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Right Column (7 cols): Interactive Live Inspector */}
          <div className="lg:col-span-7">
            <HUDCornerReticle
              label="CREDENTIAL INSPECTION MATRIX // PROOF #DA-94F2B8"
              coordinate="SHA-256: 7f8a92...e14c"
              className="h-full border-2 border-foreground bg-white shadow-[6px_6px_0px_0px_var(--foreground)] flex flex-col justify-between"
            >
              {activeLayer === "hash" && (
                <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                  <div className="p-3 bg-secondary/40 border border-foreground/20 space-y-1">
                    <span className="text-[0.55rem] text-muted-foreground font-bold block">
                      CANONICAL PAYLOAD DIGEST:
                    </span>
                    <p className="font-bold text-foreground text-xs break-all">
                      sha256:7f8a92c481b3790dfaa8172635418290bcda1248102938475610293847561029
                    </p>
                  </div>

                  <div className="space-y-2 text-[0.6rem]">
                    <div className="flex justify-between border-b border-foreground/10 pb-1">
                      <span className="text-muted-foreground">HASHING ALGORITHM:</span>
                      <span className="font-bold text-foreground">RFC-8785 Canonical JSON + SHA-256</span>
                    </div>
                    <div className="flex justify-between border-b border-foreground/10 pb-1">
                      <span className="text-muted-foreground">ISSUANCE TIMESTAMP:</span>
                      <span className="font-bold text-foreground">2026-08-15T12:00:00Z</span>
                    </div>
                    <div className="flex justify-between border-b border-foreground/10 pb-1">
                      <span className="text-muted-foreground">TAMPER STATUS:</span>
                      <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-300">
                        [✓] VERIFIED UNMODIFIED
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeLayer === "rubric" && (
                <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between items-center bg-foreground text-background p-3">
                    <span className="font-bold text-sm">FINAL PUBLISHED SCORE</span>
                    <span className="font-bold text-lg text-orange">9.4 / 10.0</span>
                  </div>

                  <div className="space-y-2 text-[0.58rem]">
                    <div className="p-2.5 bg-secondary/30 border border-foreground/15 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground block">Code Quality &amp; Clean Architecture</span>
                        <span className="text-muted-foreground">&quot;Modular domain separation, zero circular deps.&quot;</span>
                      </div>
                      <span className="font-bold text-sm text-foreground">9.5/10</span>
                    </div>

                    <div className="p-2.5 bg-secondary/30 border border-foreground/15 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground block">System Throughput &amp; Scalability</span>
                        <span className="text-muted-foreground">&quot;Redis caching strategy handles 10k req/sec.&quot;</span>
                      </div>
                      <span className="font-bold text-sm text-foreground">9.2/10</span>
                    </div>
                  </div>
                </div>
              )}

              {activeLayer === "git" && (
                <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                  <div className="p-3 bg-secondary/40 border border-foreground/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.55rem] text-muted-foreground font-bold">VERIFIED REPO:</span>
                      <span className="text-[0.55rem] text-orange font-bold">14 COMMITS AUDITED</span>
                    </div>
                    <span className="font-bold text-foreground block">
                      github.com/contestant/cairo-microservice-battle
                    </span>
                  </div>

                  <div className="p-3 border border-foreground/20 bg-card space-y-1">
                    <span className="text-[0.55rem] text-muted-foreground font-bold block">
                      5-MINUTE VIDEO DEFENSE:
                    </span>
                    <span className="font-bold text-foreground text-xs block">
                      ▶ loom.com/share/cairo-defense-2026-alex
                    </span>
                    <span className="text-[0.52rem] text-muted-foreground block">
                      Walkthrough covering architecture trade-offs and concurrency model.
                    </span>
                  </div>
                </div>
              )}

              {activeLayer === "verifier" && (
                <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                  <div className="p-4 bg-secondary/40 border border-foreground/20 space-y-2">
                    <span className="text-[0.55rem] text-muted-foreground font-bold block">
                      PUBLIC CREDENTIAL LINK:
                    </span>
                    <span className="font-bold text-foreground text-xs block break-all">
                      https://devsarena.eg/proof/cairo-battle-2026
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[0.55rem] text-muted-foreground">
                      Publicly queryable &bull; Never expires
                    </span>
                    <Link
                      href="/proof"
                      className="px-4 py-2 bg-foreground text-background font-mono text-[0.6rem] font-bold hover:bg-orange transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>TEST PUBLIC VERIFIER</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-3 border-t border-foreground/10 flex items-center justify-between">
                <span className="font-mono text-[0.52rem] text-muted-foreground">
                  SEALED IN CAIRO // DEVS ARENA TRUST LEDGER
                </span>
                <span className="font-mono text-[0.52rem] text-orange font-bold">
                  [✓] 100% AUDITABLE
                </span>
              </div>
            </HUDCornerReticle>
          </div>
        </div>
      </div>
    </section>
  );
}
