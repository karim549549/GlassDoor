"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "./Reveal";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { TIMELINE, REASSURANCES } from "./saturday/saturday-content";

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 5 - what actually happens if you enter one.
 *
 * This replaces ForCompanies, which put a hiring pitch ("Delete three rounds",
 * a recruiting pipeline with stages struck out) in front of developers who
 * arrived to find something to build. That argument moved to /companies, where
 * its audience is. See PRD 1.2.
 *
 * The section's shape is deliberately unchanged - a numbered two-column list, a
 * three-up card grid, and a docking CTA - because that layout was working. Only
 * what it says changed: the list is now a clock rather than a pipeline, which
 * is the same component doing the opposite job.
 *
 * The section arrives DARK and warms to paper as it enters, the same move
 * section 2 makes. Section 4 above it is near-black, so landing on cream was a
 * hard cut; carrying the dark in and releasing it makes the two read as one
 * document.
 *
 * That morph is why nothing below sets its own text colour. Every rule here
 * inherits from the section and varies by opacity instead, so animating one
 * `color` property recolours the whole section - a child pinned to
 * `text-foreground` would turn invisible the moment the ground went dark.
 */

const DARK_BG = "#0E0E0D";
const DARK_FG = "#F1EFE9";
const PAPER_BG = "#F1EFE9";
const PAPER_FG = "#0E0E0D";

export function ASaturday() {
  const sectionRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);

  /**
   * The floating CTA shows only while the section is on screen AND its docked
   * twin is not yet visible, so the two are never both present. That is the
   * whole handoff: the companion disappears exactly as the real button arrives,
   * which reads as docking without any shared-element position maths that could
   * desync.
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
            // most of it mid-transition, reading grey text on a greying ground.
            // The colour change is a transition between two readable states.
            start: "top 78%",
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
            [04 / A Saturday]
          </span>
          <h2 className="font-display italic text-[clamp(2rem,4.5vw,4rem)] leading-[1.02] uppercase mt-3 text-balance">
            How it actually goes
          </h2>
          <p className="text-[0.95rem] leading-relaxed opacity-75 mt-5">
            Four and a half hours, start to finish. You can do it from your desk
            or in a room with everyone else. Here is the whole thing, including
            the part where it goes wrong.
          </p>
        </Reveal>

        {/* The clock. Same list component that used to carry the hiring
            pipeline, doing the opposite job. */}
        <ol className="mt-14 border-t border-current/15">
          {TIMELINE.map((m, i) => (
            <Reveal
              as="li"
              key={m.time}
              delay={i * 70}
              className="grid grid-cols-[3.5rem_1fr] md:grid-cols-[4.5rem_minmax(0,18rem)_1fr] gap-x-4 gap-y-1 border-b border-current/15 py-5 items-baseline"
            >
              <span
                className={`font-mono text-[0.72rem] tabular-nums tracking-tight ${
                  m.emphasis ? "text-orange font-bold" : "opacity-55"
                }`}
              >
                {m.time}
              </span>

              <div>
                <h3
                  className={`font-display text-[1.15rem] leading-tight ${
                    m.emphasis ? "text-orange" : ""
                  }`}
                >
                  {m.label}
                </h3>
                <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] mt-1.5 opacity-55">
                  {m.detail}
                </p>
              </div>

              <p className="col-start-2 md:col-start-3 text-[0.85rem] leading-relaxed opacity-75">
                {m.note}
              </p>
            </Reveal>
          ))}
        </ol>

        {/* The three reasons people talk themselves out of entering. Bordered
            rather than filled, so the cards ride the background morph instead
            of fighting it with a fixed panel colour. */}
        <div className="grid gap-px mt-16 md:grid-cols-3 border border-current/15 bg-current/10">
          {REASSURANCES.map((r, i) => (
            <Reveal
              key={r.heading}
              delay={i * 90}
              className="relative p-6 md:p-7 backdrop-blur-[1px]"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-current opacity-[0.03] pointer-events-none"
              />
              <h3 className="relative font-display text-[1.2rem] leading-tight text-balance">
                {r.heading}
              </h3>
              <p className="relative text-[0.85rem] leading-relaxed opacity-75 mt-3">{r.body}</p>
            </Reveal>
          ))}
        </div>

        {/* One primary action. Hick's law - decision time rises with the number
            of options - and the one-primary-action-per-view principle both say
            three near-equal buttons dilute. */}
        <Reveal>
          <div ref={dockRef} className="mt-14">
            <Link
              href="/arena"
              className="group flex w-full items-center justify-between gap-6 border-2 border-orange bg-orange px-8 py-7 text-[#0E0E0D] shadow-[6px_6px_0_0_currentColor] hover:shadow-[10px_10px_0_0_currentColor] hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              <span>
                <span className="block font-display italic text-[clamp(1.4rem,2.6vw,2.1rem)] leading-none uppercase">
                  See what is open
                </span>
                <span className="block font-mono text-[0.55rem] uppercase tracking-[0.2em] opacity-70 mt-2">
                  Free to enter, solo or with a team
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
              Or write a brief of your own
            </Link>
            <Link
              href="/support"
              className="font-mono text-[0.6rem] uppercase tracking-[0.18em] opacity-60 hover:opacity-100 hover:text-orange transition-all"
            >
              Never done one before? &rarr;
            </Link>
          </div>
        </Reveal>

        {/* Sticky companion. Rides the section, then hands off to the docked
            button when it scrolls into view - which is what stops it becoming
            furniture. It tracks the text column's right edge rather than the
            window's: hard against the window is the right-rail position readers
            learnt to skip when it was ad inventory. */}
        <div
          aria-hidden={!floating}
          className={`pointer-events-none fixed inset-x-0 bottom-[16vh] z-40 hidden md:block transition-all duration-500 ${
            floating ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
          }`}
        >
          <div className="mx-auto flex max-w-6xl justify-end px-6 md:px-12">
            <Link
              href="/arena"
              tabIndex={floating ? 0 : -1}
              className="pointer-events-auto group flex max-w-[15rem] flex-col gap-1 border-2 border-orange bg-orange px-6 py-4 text-[#0E0E0D] shadow-[5px_5px_0_0_rgba(14,14,13,0.45)] hover:shadow-[8px_8px_0_0_rgba(14,14,13,0.45)] hover:-translate-y-0.5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              <span className="flex items-center justify-between gap-4 font-display italic text-[1.15rem] leading-none uppercase">
                See what is open
                <span className="font-mono text-[1.1rem] not-italic leading-none shrink-0 transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
              <span className="font-mono text-[0.5rem] uppercase tracking-[0.16em] opacity-70">
                Free, solo or team
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ASaturday;
