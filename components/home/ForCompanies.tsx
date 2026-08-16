"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";

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

export function ForCompanies() {
  return (
    <section className="relative z-20 w-full bg-background text-foreground border-t border-border">
      <div className="mx-auto max-w-6xl px-6 md:px-12 py-24 md:py-32">
        <Reveal as="div" className="max-w-2xl">
          <span className="block font-mono text-[0.52rem] font-bold uppercase tracking-[0.25em] text-orange">
            [04 / For companies]
          </span>
          <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-[1.02] uppercase mt-3 text-balance">
            Delete three rounds
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-foreground/70 mt-5">
            Most of a technical hiring process exists to answer one question:
            can this person actually build the thing. An arena answers it in
            public, before you ever speak to them.
          </p>
        </Reveal>

        {/* The pipeline, with the stages that stop existing struck out. */}
        <ol className="mt-14 border-t border-border">
          {PIPELINE.map((s, i) => (
            <Reveal
              as="li"
              key={s.label}
              delay={i * 70}
              className="grid grid-cols-[2rem_1fr] md:grid-cols-[3rem_minmax(0,18rem)_1fr] gap-x-4 gap-y-1 border-b border-border py-5 items-baseline"
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
                    s.cut ? "line-through decoration-accent decoration-2 text-foreground/40" : ""
                  }`}
                >
                  {s.label}
                </h3>
                <p
                  className={`font-mono text-[0.5rem] uppercase tracking-[0.14em] mt-1.5 ${
                    s.cut ? "text-foreground/35" : "text-muted-foreground"
                  }`}
                >
                  {s.detail}
                </p>
              </div>

              <p className="col-start-2 md:col-start-3 text-[0.85rem] leading-relaxed text-foreground/70">
                {s.replacedBy ?? (
                  <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Kept
                  </span>
                )}
              </p>
            </Reveal>
          ))}
        </ol>

        {/* Why it holds up */}
        <div className="grid gap-px bg-border mt-16 md:grid-cols-3 border border-border">
          {VALUE.map((v, i) => (
            <Reveal key={v.heading} delay={i * 90} className="bg-background p-6 md:p-7">
              <h3 className="font-display text-[1.2rem] leading-tight text-balance">{v.heading}</h3>
              <p className="text-[0.85rem] leading-relaxed text-foreground/70 mt-3">{v.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="flex flex-wrap items-center gap-3 mt-12">
          <Link
            href="/companies"
            className="bg-foreground text-background border border-foreground px-7 py-3.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] shadow-[3px_3px_0_0_var(--orange)] hover:shadow-[5px_5px_0_0_var(--orange)] hover:-translate-y-px active:translate-y-0 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Hire from the board
          </Link>
          <Link
            href="/arena/create"
            className="border border-foreground px-7 py-3.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Host an arena
          </Link>
          <Link
            href="/support"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground hover:text-orange transition-colors"
          >
            Talk to us first &rarr;
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default ForCompanies;
