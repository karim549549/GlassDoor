"use client";

import { useEffect, useState } from "react";

/**
 * The section index for standing pages - the sidebar that lists a document's
 * sections and marks the one you are reading.
 *
 * Two things about it are deliberate.
 *
 * The list is passed in from the server rather than discovered from the DOM on
 * mount. Scanning for headings client-side would be less code, but the index
 * would then be absent from the served HTML: invisible to crawlers, and missing
 * entirely for a reader with JS disabled, on pages whose whole job is to be
 * read. Only the *active* mark needs the browser.
 *
 * The active section is tracked with IntersectionObserver rather than a scroll
 * handler doing getBoundingClientRect on every section per frame. It fires off
 * the main thread and costs nothing while the page is idle.
 */

export interface DocSection {
  id: string;
  label: string;
}

export function DocIndex({ sections }: { sections: DocSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    // Tracks every section's on-screen state rather than reacting to one entry
    // at a time: with several visible at once, "the topmost visible one" is the
    // one being read, and that cannot be decided from a single entry.
    const visible = new Set<string>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }

        if (visible.size > 0) {
          const topmost = sections.find((s) => visible.has(s.id));
          if (topmost) setActiveId(topmost.id);
          return;
        }

        // Nothing intersecting: the reader is between sections, most often
        // past the last one. Keep the nearest heading above the fold marked
        // rather than clearing, which would make the index flicker to empty.
        let above: string | null = null;
        for (const n of nodes) {
          if (n.getBoundingClientRect().top < 120) above = n.id;
        }
        if (above) setActiveId(above);
      },
      // The band is the top of the viewport, so a section counts as "current"
      // while it is where the eye is, not merely while any part of it is on
      // screen.
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [sections]);

  /**
   * Smooth scroll has to happen here rather than through CSS.
   * `scroll-behavior: smooth` is deliberately off globally - GSAP ScrollTrigger
   * animates the scroll position itself and desyncs against it, which is what
   * left the homepage's pinned section stuck at stale coordinates. Doing it per
   * click keeps the behaviour on documents, where there is no ScrollTrigger,
   * without turning it on for the pages that break.
   *
   * Falls through to the browser's default jump if the target is missing or the
   * reader prefers reduced motion, so the link always works.
   */
  const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Let modified clicks (new tab, download) behave normally.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById(id);
    if (!target) return;

    // This handler calls preventDefault, so it has to be certain it can do the
    // scroll itself - otherwise the link silently does nothing. Bail to the
    // browser's own anchor jump if smooth scrolling is not supported.
    if (!("scrollBehavior" in document.documentElement.style)) return;

    event.preventDefault();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // `block: "start"` honours the section's scroll-margin-top, so the heading
    // clears the fixed nav instead of hiding behind it.
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

    // Move focus so a keyboard or screen-reader user actually lands in the
    // section rather than only moving the viewport. preventScroll because the
    // smooth scroll above already owns the movement.
    target.focus({ preventScroll: true });

    // pushState rather than assigning location.hash, which would jump instantly
    // and fight the animation. Keeps the URL shareable either way.
    window.history.pushState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (sections.length === 0) return null;

  return (
    <nav aria-label="On this page" className="md:sticky md:top-24">
      <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.22em] text-muted-foreground border-b border-border pb-2">
        On this page
      </p>

      <ol className="mt-3 space-y-0.5">
        {sections.map((s, i) => {
          const active = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => jumpTo(e, s.id)}
                aria-current={active ? "location" : undefined}
                className={`group flex gap-2.5 py-1.5 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.1em] transition-colors ${
                  active ? "text-orange-ink" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden
                  className={`shrink-0 tabular-nums transition-colors ${
                    active ? "text-orange-ink" : "text-muted-foreground/50"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* The active mark is carried by a left rule as well as colour,
                    so it does not rely on hue alone. */}
                <span
                  className={`border-l pl-2.5 transition-colors ${
                    active ? "border-orange" : "border-transparent"
                  }`}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default DocIndex;
