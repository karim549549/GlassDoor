"use client";

import { useState } from "react";

/**
 * The bottom half of the arena page, one section at a time.
 *
 * Everything used to stack: the full roster, then the standings, then every
 * comment. That is fine for a seeded arena with three teams and no discussion
 * and untenable for a real one — fifty teams of four is two hundred names
 * before a reader reaches the first comment, and a thousand comments is a page
 * nobody can scroll to the end of.
 *
 * Tabs also buy something that is not just layout: the comment list is a
 * client component that fetches on mount, and only the active panel is
 * rendered. Opening an arena no longer requests a discussion nobody asked to
 * read.
 *
 * Inactive panels are unmounted rather than hidden, which is the whole point —
 * `hidden` would still mount them and still fire the fetch. The cost is that
 * switching back re-fetches; for a discussion that is correct anyway, since it
 * may have moved on.
 */

export interface ArenaSection {
  key: string;
  label: string;
  /** Shown beside the label. Omit where a count would be a lie. */
  count?: number;
  content: React.ReactNode;
}

export function ArenaSectionTabs({ sections }: { sections: ArenaSection[] }) {
  const [active, setActive] = useState(sections[0]?.key ?? "");

  if (sections.length === 0) return null;

  const current = sections.find((s) => s.key === active) ?? sections[0];

  return (
    <section className="border-t-2 border-foreground">
      <div
        role="tablist"
        aria-label="Arena sections"
        className="flex flex-wrap gap-x-1 border-b border-foreground/15"
      >
        {sections.map((section) => {
          const isActive = section.key === current.key;

          return (
            <button
              key={section.key}
              role="tab"
              type="button"
              id={`arena-tab-${section.key}`}
              aria-selected={isActive}
              aria-controls={`arena-panel-${section.key}`}
              onClick={() => setActive(section.key)}
              className={[
                "-mb-px cursor-pointer border-b-2 px-4 py-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange",
                isActive
                  ? "border-orange text-foreground"
                  : "border-transparent text-foreground/55 hover:border-foreground/25 hover:text-foreground",
              ].join(" ")}
            >
              {section.label}
              {typeof section.count === "number" && (
                <span
                  className={`ml-2 tabular-nums ${isActive ? "text-orange-ink" : "text-foreground/40"}`}
                >
                  {section.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`arena-panel-${current.key}`}
        aria-labelledby={`arena-tab-${current.key}`}
        className="pt-8"
      >
        {current.content}
      </div>
    </section>
  );
}

export default ArenaSectionTabs;
