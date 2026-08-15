"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code2, ShieldCheck, UserCheck, ArrowRight, CheckCircle2, Terminal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  {
    step: "01",
    id: "developer",
    tag: "DEVELOPER ENGINE",
    title: "Compete In Timed Code Sprints",
    subtitle: "Real engineering problems. Automated code runners. Zero take-homes.",
    description:
      "Join timed sprint arenas across Backend, AI, Systems, and Full-Stack. Solve real-world problem sets under live automated test harness evaluation, earn Glicko-2 rating calibrations, and bypass resume screening forever.",
    highlights: [
      "Automated unit & performance test harnesses",
      "Glicko-2 domain rating calibration (9 domains)",
      "Solo & squad sprint leaderboards with anti-cheat",
    ],
    ctaText: "Enter Active Arenas",
    ctaLink: "/arena",
    icon: Code2,
    badge: "STAGE 01 // EXECUTE",
    stats: [
      { label: "SPRINT DURATION", value: "24h - 72h" },
      { label: "TEST SUITE RUNNER", value: "ISOLATED DOCKER" },
      { label: "RATING DOMAIN", value: "MULTI-GLICKO-2" },
    ],
    mockup: {
      type: "terminal",
      header: "CAIRO_RUNNER // SPRINT #142",
      status: "ALL PASSING",
      lines: [
        { label: "EXECUTION:", text: "14.2ms [HIGH SPEED]" },
        { label: "MEMORY:", text: "32.4MB / 512MB CAP" },
        { label: "TESTS:", text: "24/24 ASSERTIONS [✓]" },
        { label: "GLICKO GAIN:", text: "+45 Δ (SYSTEMS // 1842)", highlight: true },
      ],
    },
  },
  {
    step: "02",
    id: "protocol",
    tag: "CRYPTOGRAPHIC PROOF",
    title: "Generate Tamper-Evident Proof Packets",
    subtitle: "Cryptographically signed performance digest. Verifiable anywhere.",
    description:
      "Every arena submission is compiled into an immutable SHA-256 Proof Packet. Contains commit digests, rubric scorecards, runtime memory profiles, and benchmark percentiles that no candidate can fake and no recruiter can dispute.",
    highlights: [
      "SHA-256 tamper-evident digital signature",
      "Granular published rubric breakdown (0-100)",
      "Independent double-blind peer scoring verification",
    ],
    ctaText: "Inspect Sample Proof Packet",
    ctaLink: "/proof",
    icon: ShieldCheck,
    badge: "STAGE 02 // PROVE",
    stats: [
      { label: "SIGNATURE", value: "SHA-256 DIGEST" },
      { label: "RUBRIC WEIGHT", value: "PUBLISHED DDL" },
      { label: "VERIFICATION", value: "INSTANT QR / URL" },
    ],
    mockup: {
      type: "proof",
      header: "PROOF_PACKET // DIGEST_0x8f2a9e",
      status: "AUTHENTICATED",
      lines: [
        { label: "CANDIDATE ID:", text: "DEV_89124 [VERIFIED]" },
        { label: "RUBRIC TOTAL:", text: "94.5 / 100 [ELITE TIER]", highlight: true },
        { label: "ARCHITECTURE:", text: "98% // MODULAR CLEAN" },
        { label: "INTEGRITY:", text: "UNFORGEABLE SHA-256" },
      ],
    },
  },
  {
    step: "03",
    id: "recruiter",
    tag: "HIRING FAST-TRACK",
    title: "Skip Technical Screens. Hire Verified Talent.",
    subtitle: "Direct access to top 5% benchmarked engineers based on real code.",
    description:
      "Hiring teams filter candidates by verified Glicko-2 ratings and live challenge scorecards. Wave round 1 take-homes and algorithmic whiteboards—hire engineers based on actual code execution and proven problem-solving.",
    highlights: [
      "78% reduction in technical screening time",
      "Direct talent pipeline with verified skills",
      "Eliminate unvetted resume spam forever",
    ],
    ctaText: "Explore Recruiter Pipeline",
    ctaLink: "/recruiter",
    icon: UserCheck,
    badge: "STAGE 03 // HIRE",
    stats: [
      { label: "TIME-TO-HIRE", value: "-78% SCREEN TIME" },
      { label: "TALENT POOL", value: "TOP 5% EGYPT" },
      { label: "RECRUITER ACCESS", value: "INSTANT PIPELINE" },
    ],
    mockup: {
      type: "recruiter",
      header: "RECRUITER_PIPELINE // MATCH",
      status: "FAST-TRACK READY",
      lines: [
        { label: "TALENT MATCH:", text: "TOP 2.4% CAIRO PROTOCOL" },
        { label: "TECH SCREEN:", text: "WAIVED BY PROOF [✓]", highlight: true },
        { label: "CONFIDENCE:", text: "GLICKO RD < 45 [HIGH]" },
        { label: "ACTION:", text: "DIRECT INTERVIEW INVITE" },
      ],
    },
  },
];

export function ThreeSidedPerspective() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const track = trackRef.current;
    const progressBar = progressBarRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      // 1. Reveal Animation for the Section Header & Title
      if (header) {
        gsap.fromTo(
          header.querySelectorAll(".header-reveal-el"),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const mm = gsap.matchMedia();

      // Desktop & Tablet (>= 768px): Dedicated Pinned Horizontal Scroll Scrub
      mm.add("(min-width: 768px)", () => {
        const calculateScroll = () => {
          const trackWidth = track.scrollWidth;
          const windowWidth = window.innerWidth;
          return -(trackWidth - windowWidth + 120);
        };

        const horizontalTween = gsap.to(track, {
          x: calculateScroll,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2200",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Update live progress bar
              if (progressBar) {
                progressBar.style.width = `${Math.min(self.progress * 100, 100)}%`;
              }
              // Determine active step index (0, 1, 2)
              const step = Math.min(Math.floor(self.progress * 3), 2);
              setActiveStepIndex(step);
            },
          },
        });

        // Parallax card depth and reveal animations
        const cards = track.querySelectorAll(".timeline-card");
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.92, opacity: 0.6 },
            {
              scale: 1,
              opacity: 1,
              ease: "power1.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: "left 85%",
                end: "center 50%",
                scrub: true,
              },
            }
          );
        });
      });

      // Mobile (< 768px): Vertical stacked scrub cards
      mm.add("(max-width: 767px)", () => {
        const cards = track.querySelectorAll(".timeline-card");
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0.3, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                end: "center 50%",
                scrub: 0.5,
              },
            }
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full bg-[#0E0E0D] text-[#F1EFE9] border-t border-white/10 overflow-hidden select-none"
    >
      {/* Background blueprint grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="timeline-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#timeline-grid)" />
        </svg>
      </div>

      {/* Stage Wrapper */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between py-10 md:py-14 px-6 md:px-14">
        {/* Full-Width Section Header (Title has full space without being cramped by stepper) */}
        <div
          ref={headerRef}
          className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10"
        >
          <div className="space-y-2 max-w-4xl">
            <div className="header-reveal-el inline-flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-orange font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
              <span>[04 // PLATFORM LIFECYCLE // HORIZONTAL PROTOCOL]</span>
            </div>
            <h2 className="header-reveal-el font-display italic text-[clamp(2.2rem,4.5vw,3.8rem)] leading-none uppercase font-normal text-white">
              The Code-To-Contract Pipeline
            </h2>
          </div>

          {/* Subtitle / Telemetry tag on right */}
          <div className="header-reveal-el font-mono text-[0.58rem] text-white/50 uppercase tracking-[0.2em] hidden sm:block">
            <span>&gt; 3-PHASE TRUSTLESS HIRING SYSTEM</span>
          </div>
        </div>

        {/* Horizontal Parallax Track */}
        <div className="w-full my-auto py-6 overflow-visible">
          <div
            ref={trackRef}
            className="timeline-horizontal-track flex flex-col md:flex-row gap-8 md:gap-12 will-change-transform"
          >
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  className="timeline-card w-full md:w-[720px] lg:w-[840px] shrink-0 p-6 md:p-10 bg-[#141413]/90 border border-white/15 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.8)] relative group transition-all duration-300 hover:border-orange/60"
                >
                  {/* HUD Corner Brackets */}
                  <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-orange pointer-events-none" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-orange pointer-events-none" />
                  <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-orange pointer-events-none" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-orange pointer-events-none" />

                  {/* Card Top Telemetry */}
                  <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-orange/10 border border-orange/30 flex items-center justify-center text-orange">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.2em] text-orange block">
                          {stage.badge}
                        </span>
                        <span className="font-mono text-xs text-white/60 font-semibold tracking-wider">
                          PHASE // {stage.tag}
                        </span>
                      </div>
                    </div>

                    <div className="font-display italic text-3xl md:text-4xl text-white/20 font-bold group-hover:text-orange/40 transition-colors">
                      {stage.step}
                    </div>
                  </div>

                  {/* Card Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-stretch">
                    {/* Left Column: Narrative & Bullets (7 cols) */}
                    <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="font-display italic text-2xl md:text-3xl text-white font-normal uppercase tracking-tight leading-snug">
                          {stage.title}
                        </h3>
                        <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>

                      {/* Key highlights */}
                      <div className="space-y-2 py-2">
                        {stage.highlights.map((item, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2.5 font-mono text-[0.62rem] text-white/90">
                            <CheckCircle2 className="w-3.5 h-3.5 text-orange shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Link */}
                      <div className="pt-3">
                        <Link
                          href={stage.ctaLink}
                          className="inline-flex items-center gap-3 px-6 py-2.5 bg-orange text-black font-mono text-[0.62rem] font-extrabold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_20px_rgba(255,107,0,0.3)] group/btn"
                        >
                          <span>{stage.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: Simulated Live Telemetry Widget (5 cols) */}
                    <div className="lg:col-span-5 bg-[#090A0B] border border-white/10 p-5 font-mono text-[0.58rem] flex flex-col justify-between space-y-4 shadow-inner">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span className="text-white/60 tracking-wider flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-orange" />
                          {stage.mockup.header}
                        </span>
                        <span className="text-[0.5rem] px-2 py-0.5 bg-orange/15 text-orange border border-orange/30 font-bold">
                          {stage.mockup.status}
                        </span>
                      </div>

                      <div className="space-y-2.5 py-1">
                        {stage.mockup.lines.map((line, lIdx) => (
                          <div key={lIdx} className="flex justify-between items-center gap-2">
                            <span className="text-white/40">{line.label}</span>
                            <span
                              className={`text-right ${
                                line.highlight
                                  ? "text-orange font-bold"
                                  : "text-white/90"
                              }`}
                            >
                              {line.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Mini Stats Footer */}
                      <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                        {stage.stats.map((st, sIdx) => (
                          <div key={sIdx} className="space-y-0.5">
                            <span className="text-[0.46rem] text-white/40 block tracking-widest">{st.label}</span>
                            <span className="text-[0.55rem] text-white font-bold block">{st.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stepper & Progress HUD Placed Below the Cards */}
        <div className="w-full pt-4 border-t border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Live Step Indicator Stepper */}
            <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-wider font-bold">
              {STAGES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`px-3 py-1.5 border transition-all duration-300 flex items-center gap-2 ${
                    activeStepIndex === idx
                      ? "bg-orange text-black border-orange font-extrabold shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                      : "bg-white/[0.03] text-white/50 border-white/15 hover:text-white"
                  }`}
                >
                  <span>STEP {s.step}</span>
                  <span className="hidden sm:inline text-[0.5rem] opacity-80">[{s.tag}]</span>
                </div>
              ))}
            </div>

            {/* Visual Scrub Bar & Telemetry Status */}
            <div className="flex items-center gap-4">
              <div className="font-mono text-[0.52rem] text-orange font-bold">
                [SCROLL TO ADVANCE]
              </div>
              <div className="w-32 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-orange rounded-full transition-all duration-75 w-[33%]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Footer */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 pt-2 font-mono text-[0.52rem] text-white/50 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-3">
              <span>&bull;</span>
              <span>3-PHASE RECRUITING PIPELINE</span>
              <span>&bull;</span>
              <span>TAMPER-EVIDENT VERIFICATION</span>
            </div>
            <div className="flex items-center gap-4">
              <span>CAIRO PROTOCOL // LAT: 30.0444° N</span>
              <span>&bull;</span>
              <span>VERIFIED ON GLICKO-2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThreeSidedPerspective;
