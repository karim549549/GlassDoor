"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "./Reveal";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 5 - the hiring side.
 *
 * This is the first thing on the page addressed to the people who pay. Four
 * sections had gone by selling arenas to developers, and the section this
 * replaced was a SHA-256 verifier: correct, real, and a documentation page. A
 * landing page has to say what the reader gets, not how the machine works.
 *
 * The argument is made by deletion. Rather than claim a percentage nobody has
 * measured yet, it shows a hiring pipeline with three stages struck out and
 * says who removed them - which is checkable, and true on day one.
 *
 * The section arrives DARK and warms to paper as it centres, the same move
 * section 2 makes on the way in. Section 4 above it is near-black, so landing
 * on cream was a hard cut; carrying the dark in and releasing it mid-scroll
 * makes the two read as one document.
 *
 * That morph is why nothing below sets its own text colour. Every rule here
 * inherits from the section and varies by opacity instead, so animating one
 * `color` property recolours the whole section - a child pinned to
 * `text-foreground` would turn invisible the moment the ground went dark.
 */

interface Stage {
  label: string;
  detail: string;
  /** Struck through: this stage stops existing. */
  cut?: boolean;
  /** The replacement, shown where a cut stage used to be. */
  replacedBy?: string;
}

const PIPELINE: Stage[] = [
  { label: "Post the role", detail: "Same as today" },
  {
    label: "Sift 200 CVs",
    detail: "Self-reported, unverifiable, mostly noise",
    cut: true,
    replacedBy: "Open the board. Every entrant already has judged work attached.",
  },
  {
    label: "Screening call",
    detail: "Half an hour to establish they can code at all",
    cut: true,
    replacedBy: "Read the commits and the defense. That question is answered.",
  },
  {
    label: "Take-home exercise",
    detail: "Unpaid, unsupervised, and nobody knows who wrote it",
    cut: true,
    replacedBy: "The arena was the exercise - timed, watched, and judged in public.",
  },
  { label: "Technical interview", detail: "Now about how they think, not whether they can" },
  { label: "Offer", detail: "Made on evidence rather than on impression" },
];

const VALUE = [
  {
    heading: "You see the work, not a summary of it",
    body: "Every candidate arrives with a proof packet: the brief they were given, the commits they made under the clock, and each judge's score with written reasoning.",
  },
  {
    heading: "The rubric was frozen before anyone started",
    body: "So the scoring cannot be shaped around a favoured result. Judges are named, and cannot score their own team - that is a database constraint, not a policy promise.",
  },
  {
    heading: "Or set the problem yourself",
    body: "Host an arena around work you actually need done. You choose the brief, the clock and the deliverables, and you can change the requirements partway through to see who adapts.",
  },
];

const DARK_BG = "#0E0E0D";
const DARK_FG = "#F1EFE9";
const PAPER_BG = "#F1EFE9";
const PAPER_FG = "#0E0E0D";

export function ForCompanies() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        { backgroundColor: DARK_BG, color: DARK_FG },
        {
          backgroundColor: PAPER_BG,
          color: PAPER_FG,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            // Carries the dark in from section 4 and has fully warmed by the
            // time the section sits in the middle of the viewport.
            start: "top bottom",
            end: "center center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      // Starts dark inline so the first paint matches section 4 above, before
      // any script runs.
      style={{ backgroundColor: DARK_BG, color: DARK_FG }}
      className="relative z-20 w-full border-t border-current/15 overflow-hidden"
    >
      <BackgroundGrid opacity={0.07} />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-12 py-24 md:py-32">
        <Reveal as="div" className="max-w-2xl">
          <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
            [04 / For companies]
          </span>
          <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-[1.02] uppercase mt-3 text-balance">
            Delete three rounds
          </h2>
          <p className="text-[0.95rem] leading-relaxed opacity-75 mt-5">
            Most of a technical hiring process exists to answer one question:
            can this person actually build the thing. An arena answers it in
            public, before you ever speak to them.
          </p>
        </Reveal>

        {/* The pipeline, with the stages that stop existing struck out. */}
        <ol className="mt-14 border-t border-current/15">
          {PIPELINE.map((s, i) => (
            <Reveal
              as="li"
              key={s.label}
              delay={i * 70}
              className="grid grid-cols-[2rem_1fr] md:grid-cols-[3rem_minmax(0,18rem)_1fr] gap-x-4 gap-y-1 border-b border-current/15 py-5 items-baseline"
            >
              <span
                className={`font-mono text-[0.6rem] tabular-nums ${
                  s.cut ? "text-accent line-through" : "text-orange"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div>
                <h3
                  className={`font-display text-[1.15rem] leading-tight ${
                    s.cut ? "line-through decoration-accent decoration-2 opacity-45" : ""
                  }`}
                >
                  {s.label}
                </h3>
                <p
                  className={`font-mono text-[0.5rem] uppercase tracking-[0.14em] mt-1.5 ${
                    s.cut ? "opacity-40" : "opacity-60"
                  }`}
                >
                  {s.detail}
                </p>
              </div>

              <p className="col-start-2 md:col-start-3 text-[0.85rem] leading-relaxed opacity-75">
                {s.replacedBy ?? (
                  <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] opacity-60">
                    Kept
                  </span>
                )}
              </p>
            </Reveal>
          ))}
        </ol>

        {/* Why it holds up. Bordered rather than filled, so the cards ride the
            background morph instead of fighting it with a fixed panel colour. */}
        <div className="grid gap-px mt-16 md:grid-cols-3 border border-current/15 bg-current/10">
          {VALUE.map((v, i) => (
            <Reveal
              key={v.heading}
              delay={i * 90}
              className="relative p-6 md:p-7 backdrop-blur-[1px]"
              // Sits on the section's own ground; the hairline gap above shows
              // through as the divider.
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-current opacity-[0.03] pointer-events-none"
              />
              <h3 className="relative font-display text-[1.2rem] leading-tight text-balance">
                {v.heading}
              </h3>
              <p className="relative text-[0.85rem] leading-relaxed opacity-75 mt-3">{v.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="flex flex-wrap items-center gap-3 mt-12">
          {/* Orange reads on both grounds, so the primary action survives the
              morph without needing its own animation. */}
          <Link
            href="/companies"
            className="bg-orange text-[#0E0E0D] border border-orange px-7 py-3.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] shadow-[3px_3px_0_0_currentColor] hover:shadow-[5px_5px_0_0_currentColor] hover:-translate-y-px active:translate-y-0 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Hire from the board
          </Link>
          <Link
            href="/arena/create"
            className="border border-current px-7 py-3.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] hover:bg-orange hover:border-orange hover:text-[#0E0E0D] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Host an arena
          </Link>
          <Link
            href="/support"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] opacity-60 hover:opacity-100 hover:text-orange transition-all"
          >
            Talk to us first &rarr;
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default ForCompanies;
