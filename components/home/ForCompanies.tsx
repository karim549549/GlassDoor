"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const dockRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);

  /**
   * The floating CTA is shown only while the section is on screen AND its
   * docked twin is not yet visible, so the two are never both present. That is
   * the whole handoff: the companion disappears exactly as the real button
   * arrives, which reads as docking without any shared-element position maths
   * that could desync.
   *
   * IntersectionObserver rather than a scroll listener or a rAF loop: it fires
   * off the main thread, costs nothing while idle, and does not depend on the
   * animation frame clock.
   */
  useEffect(() => {
    const section = sectionRef.current;
    const dock = dockRef.current;
    if (!section || !dock) return;

    let sectionVisible = false;
    let dockVisible = false;
    const sync = () => setFloating(sectionVisible && !dockVisible);

    const sectionIo = new IntersectionObserver(
      ([e]) => {
        // Requires a real amount of the section on screen, so the companion
        // does not flash as the reader passes the boundary.
        sectionVisible = e.isIntersecting;
        sync();
      },
      { threshold: 0.15 }
    );
    const dockIo = new IntersectionObserver(
      ([e]) => {
        dockVisible = e.isIntersecting;
        sync();
      },
      { rootMargin: "0px 0px -15% 0px" }
    );

    sectionIo.observe(section);
    dockIo.observe(dock);
    return () => {
      sectionIo.disconnect();
      dockIo.disconnect();
    };
  }, []);

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
          duration: 0.65,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            // A trip point, not a dial. Scrubbing tied the morph to scroll
            // position, so a reader working through a section this tall spent
            // most of it mid-transition - grey text on a greying ground, at
            // exactly the point the page starts addressing the people who pay.
            // The colour change is a transition between two readable states;
            // the states are the point, not the travel between them.
            start: "top 78%",
            // Fires early - the section runs well past 100vh, so waiting for
            // its centre would put the switch far below the first screenful
            // the reader is already reading.
            toggleActions: "play none none reverse",
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

        {/* One primary action, two demoted to links.
            There were three buttons of near-equal weight here. Hick's law -
            decision time rises with the number of options - and the general
            one-primary-action-per-view principle both say that dilutes: a
            recruiter reaching this point had to decide what KIND of visitor
            they were before they could act on anything. */}
        <Reveal>
          <div ref={dockRef} className="mt-14">
            <Link
              href="/companies"
              className="group flex w-full items-center justify-between gap-6 border-2 border-orange bg-orange px-8 py-7 text-[#0E0E0D] shadow-[6px_6px_0_0_currentColor] hover:shadow-[10px_10px_0_0_currentColor] hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              <span>
                <span className="block font-display italic text-[clamp(1.4rem,2.6vw,2.1rem)] leading-none uppercase">
                  See how hiring works
                </span>
                <span className="block font-mono text-[0.55rem] uppercase tracking-[0.2em] opacity-70 mt-2">
                  What a proof packet contains, and what it does not
                </span>
              </span>
              <span className="font-mono text-[1.6rem] leading-none shrink-0 transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-6">
            <Link
              href="/arena/create"
              className="font-mono text-[0.6rem] uppercase tracking-[0.18em] opacity-70 hover:opacity-100 hover:text-orange transition-all border-b border-current/30 pb-0.5"
            >
              Or host an arena yourself
            </Link>
            <Link
              href="/support"
              className="font-mono text-[0.6rem] uppercase tracking-[0.18em] opacity-60 hover:opacity-100 hover:text-orange transition-all"
            >
              Talk to us first &rarr;
            </Link>
          </div>
        </Reveal>

        {/* Sticky companion.
            Rides the section, then hands off to the docked button above when it
            scrolls into view - which is what stops it becoming furniture. A
            persistent element that never changes state is what banner blindness
            trains people to ignore; one that arrives, tracks, and visibly gives
            way to its full-size self does not.
            Scoped to this section on purpose: a page-wide fixed bar occludes
            content everywhere else and is the exact pattern readers have learnt
            to skip. */}
        <div
          aria-hidden={!floating}
          className={`pointer-events-none fixed inset-x-0 bottom-6 z-40 hidden justify-center px-6 md:flex transition-all duration-500 ${
            floating ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Link
            href="/companies"
            tabIndex={floating ? 0 : -1}
            className="pointer-events-auto flex items-center gap-4 border-2 border-orange bg-orange px-6 py-3.5 text-[#0E0E0D] shadow-[4px_4px_0_0_rgba(14,14,13,0.5)] hover:shadow-[6px_6px_0_0_rgba(14,14,13,0.5)] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em]">
              See how hiring works
            </span>
            <span className="font-mono text-[0.9rem] leading-none">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForCompanies;
