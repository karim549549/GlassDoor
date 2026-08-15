"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Lock, CheckCircle2, FileCode, Video, Award, ExternalLink, Hash, Copy, Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type ProofLayer = "hash" | "rubric" | "git" | "verifier";

export function InteractiveProofVisualizer() {
  const [activeLayer, setActiveLayer] = useState<ProofLayer>("hash");
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Background color morph: starts in Black (#0E0E0D) and transitions to Cream White (#F1EFE9) in the middle of the section
      gsap.fromTo(
        section,
        {
          backgroundColor: "#0E0E0D",
          color: "#F1EFE9",
        },
        {
          backgroundColor: "#F1EFE9",
          color: "#0E0E0D",
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
            end: "center 40%",
            scrub: 0.8,
          },
        }
      );

      // Section header and cards reveal animation
      const revealElements = section.querySelectorAll(".proof-reveal-el");
      gsap.fromTo(
        revealElements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCopyHash = () => {
    navigator.clipboard.writeText("sha256:7f8a92c481b3790dfaa8172635418290bcda1248102938475610293847561029");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={sectionRef}
      className="proof-section-container relative z-20 w-full py-24 md:py-36 px-6 md:px-12 bg-[#0E0E0D] text-[#F1EFE9] border-t border-white/10 transition-colors duration-500 overflow-hidden select-none"
    >
      {/* Universal Blueprint Grid Overlay covering the whole section */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="proof-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#proof-grid)" />
        </svg>
      </div>

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="proof-reveal-el text-left space-y-3 max-w-3xl pb-6 border-b border-current/15">
          <div className="inline-flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-orange font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            <span>[05 // CRYPTOGRAPHIC ANATOMY // PROOF PROTOCOL]</span>
          </div>
          <h2 className="font-display italic text-[clamp(2.2rem,4.5vw,3.8rem)] leading-none uppercase font-normal text-current">
            The Proof Packet Credential
          </h2>
          <p className="font-sans text-sm text-current/80 leading-relaxed">
            Every sprint deliverable is sealed into an immutable JSON snapshot, signed with SHA-256, and tied to the developer&apos;s public credential ledger.
          </p>
        </div>

        {/* Interactive 4-Layer Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (5 cols): Layer Selection Navigation */}
          <div className="proof-reveal-el lg:col-span-5 flex flex-col justify-between gap-3.5">
            <button
              onClick={() => setActiveLayer("hash")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "hash"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <Hash className={`w-4 h-4 ${activeLayer === "hash" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">01 / SHA-256 Canonical Seal</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "hash" ? "text-background/70" : "text-current/60"}`}>
                    Deterministic payload digest
                  </span>
                </div>
              </div>
              <Lock className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("rubric")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "rubric"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className={`w-4 h-4 ${activeLayer === "rubric" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">02 / Named Judge Rubric</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "rubric" ? "text-background/70" : "text-current/60"}`}>
                    Multi-criteria scored breakdown
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("git")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "git"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCode className={`w-4 h-4 ${activeLayer === "git" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">03 / GitHub &amp; Video Defense</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "git" ? "text-background/70" : "text-current/60"}`}>
                    Synced commits &amp; architecture video
                  </span>
                </div>
              </div>
              <Video className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => setActiveLayer("verifier")}
              className={`p-5 border-2 text-left transition-all font-mono text-xs flex items-center justify-between relative group ${
                activeLayer === "verifier"
                  ? "border-orange bg-foreground text-background shadow-[4px_4px_0px_0px_var(--orange)]"
                  : "border-current/20 bg-card/60 hover:border-current/60 text-current backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-4 h-4 ${activeLayer === "verifier" ? "text-orange" : "text-orange/80"}`} />
                <div>
                  <span className="font-bold block text-sm">04 / Public Verification Portal</span>
                  <span className={`text-[0.55rem] block ${activeLayer === "verifier" ? "text-background/70" : "text-current/60"}`}>
                    Instant employer validation URL
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Right Column (7 cols): Interactive Live Inspector */}
          <div className="proof-reveal-el lg:col-span-7">
            <div className="relative border-2 border-current bg-card p-6 md:p-8 font-mono text-[0.65rem] uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(255,107,0,0.8)] flex flex-col justify-between h-full">
              {/* Corner Reticle Accents */}
              <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-orange pointer-events-none" />
              <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-orange pointer-events-none" />
              <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-orange pointer-events-none" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-orange pointer-events-none" />

              {/* Inspector Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 mb-6 border-b border-current/15 text-[0.55rem] font-bold">
                <span className="text-orange tracking-widest">[CREDENTIAL INSPECTION MATRIX // PROOF #DA-94F2B8]</span>
                <span className="tracking-widest opacity-70">SHA-256: 7f8a92...e14c</span>
              </div>

              {/* Dynamic Layer Content */}
              <div className="my-auto space-y-6">
                {activeLayer === "hash" && (
                  <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                    <div className="p-4 bg-black/5 dark:bg-white/5 border border-current/20 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[0.55rem] opacity-70 font-bold block">
                          CANONICAL PAYLOAD DIGEST:
                        </span>
                        <button
                          onClick={handleCopyHash}
                          className="flex items-center gap-1 text-[0.52rem] text-orange hover:underline uppercase font-bold"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? "COPIED" : "COPY HASH"}</span>
                        </button>
                      </div>
                      <p className="font-bold text-foreground text-xs break-all leading-relaxed">
                        sha256:7f8a92c481b3790dfaa8172635418290bcda1248102938475610293847561029
                      </p>
                    </div>

                    <div className="space-y-2.5 text-[0.6rem]">
                      <div className="flex justify-between border-b border-current/10 pb-1.5">
                        <span className="opacity-70">HASHING ALGORITHM:</span>
                        <span className="font-bold text-foreground">RFC-8785 Canonical JSON + SHA-256</span>
                      </div>
                      <div className="flex justify-between border-b border-current/10 pb-1.5">
                        <span className="opacity-70">ISSUANCE TIMESTAMP:</span>
                        <span className="font-bold text-foreground">2026-08-15T12:00:00Z</span>
                      </div>
                      <div className="flex justify-between border-b border-current/10 pb-1.5">
                        <span className="opacity-70">TAMPER STATUS:</span>
                        <span className="font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 border border-green-500/30">
                          [✓] VERIFIED UNMODIFIED
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeLayer === "rubric" && (
                  <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                    <div className="flex justify-between items-center bg-foreground text-background p-4 shadow-sm">
                      <span className="font-bold text-sm">FINAL PUBLISHED SCORE</span>
                      <span className="font-bold text-lg text-orange">94.5 / 100.0</span>
                    </div>

                    <div className="space-y-2.5 text-[0.58rem]">
                      <div className="p-3 bg-black/5 dark:bg-white/5 border border-current/15 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-foreground block text-xs">Code Quality &amp; Clean Architecture</span>
                          <span className="opacity-70">&quot;Modular domain separation, zero circular dependencies.&quot;</span>
                        </div>
                        <span className="font-bold text-sm text-orange">95/100</span>
                      </div>

                      <div className="p-3 bg-black/5 dark:bg-white/5 border border-current/15 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-foreground block text-xs">System Throughput &amp; Scalability</span>
                          <span className="opacity-70">&quot;Redis caching strategy handles 10,000 requests/sec.&quot;</span>
                        </div>
                        <span className="font-bold text-sm text-orange">94/100</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeLayer === "git" && (
                  <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                    <div className="p-4 bg-black/5 dark:bg-white/5 border border-current/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.55rem] opacity-70 font-bold">VERIFIED REPO COMMIT DIGEST:</span>
                        <span className="text-[0.55rem] text-orange font-bold">14 COMMITS AUDITED</span>
                      </div>
                      <span className="font-bold text-foreground text-xs block">
                        github.com/contestant/cairo-microservice-battle
                      </span>
                    </div>

                    <div className="p-4 border border-current/20 bg-card space-y-1.5">
                      <span className="text-[0.55rem] opacity-70 font-bold block">
                        5-MINUTE VIDEO DEFENSE RECORDING:
                      </span>
                      <span className="font-bold text-foreground text-xs block text-orange">
                        ▶ loom.com/share/cairo-defense-2026-alex
                      </span>
                      <span className="text-[0.52rem] opacity-70 block">
                        Technical walkthrough explaining system architecture, concurrency, and trade-offs.
                      </span>
                    </div>
                  </div>
                )}

                {activeLayer === "verifier" && (
                  <div className="space-y-4 font-mono text-xs animate-in fade-in duration-200">
                    <div className="p-4 bg-black/5 dark:bg-white/5 border border-current/20 space-y-2">
                      <span className="text-[0.55rem] opacity-70 font-bold block">
                        PUBLIC IMMUTABLE CREDENTIAL LINK:
                      </span>
                      <span className="font-bold text-foreground text-xs block break-all">
                        https://devsarena.eg/proof/cairo-battle-2026
                      </span>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-[0.55rem] opacity-70">
                        Publicly queryable &bull; SHA-256 Validated &bull; Never expires
                      </span>
                      <Link
                        href="/proof"
                        className="px-5 py-2.5 bg-foreground text-background font-mono text-[0.62rem] font-bold hover:bg-orange hover:text-black transition-colors inline-flex items-center gap-2 shadow-sm"
                      >
                        <span>OPEN PUBLIC VERIFIER</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Inspector Footer */}
              <div className="mt-6 pt-3 border-t border-current/15 flex items-center justify-between">
                <span className="font-mono text-[0.52rem] opacity-60">
                  SEALED IN CAIRO // DEVS ARENA TRUST PROTOCOL
                </span>
                <span className="font-mono text-[0.52rem] text-orange font-bold">
                  [✓] 100% AUDITABLE &amp; SIGNED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveProofVisualizer;
