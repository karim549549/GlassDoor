"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered reveal.
 *
 * Safe for SEO by construction: the content is server-rendered into the HTML and
 * only its opacity and transform are animated. Nothing is mounted late and
 * nothing uses `display: none`, so a crawler reads the same markup a reader
 * does. That is the whole reason the hidden state lives in CSS rather than in
 * React state - see globals.css.
 *
 * Three fallbacks, each one rule rather than a branch in here:
 *   - `prefers-reduced-motion` neutralises it
 *   - `<noscript>` in the root layout unhides everything
 *   - a rule for the brief moment before hydration, so nothing flashes
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Stagger in ms, for siblings revealing as a group. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement & HTMLSpanElement>}
      className={cn("reveal", shown && "is-in", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
