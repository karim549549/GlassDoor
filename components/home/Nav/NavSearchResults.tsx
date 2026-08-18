"use client";

import Image from "next/image";
import { CornerDownLeft } from "lucide-react";
import type { SearchGroup, SearchHit } from "@/lib/client/useSiteSearch";

/**
 * Grouped results, five per group.
 *
 * Grouping is not decoration here - "karim" is plausibly a person and
 * plausibly a brief, and a flat list makes a reader work out which kind each
 * row is from its text. The heading does that work once per group.
 *
 * Five is deliberate: enough to recognise the right one, short enough that the
 * whole panel is still scannable when several groups have hits. Anyone who
 * needs the sixth needs a filtered page, not a longer dropdown.
 *
 * `activeIndex` is an index into the FLAT order across all groups, so the
 * arrow keys cross group boundaries without the caller having to know how the
 * groups are shaped.
 */
interface NavSearchResultsProps {
  groups: SearchGroup[];
  loading: boolean;
  failed: boolean;
  query: string;
  activeIndex: number;
  onSelect: (hit: SearchHit) => void;
  onHover: (index: number) => void;
}

export function NavSearchResults({
  groups,
  loading,
  failed,
  query,
  activeIndex,
  onSelect,
  onHover,
}: NavSearchResultsProps) {
  if (failed) {
    return (
      <p className="px-5 py-10 text-center font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent">
        Search is not answering. Try again.
      </p>
    );
  }

  if (loading) {
    return (
      <ul aria-hidden className="animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 px-5 py-3">
            <span className="h-7 w-7 shrink-0 bg-foreground/12" />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="block h-[1rem] w-2/5 bg-foreground/14" />
              <span className="block h-[0.6rem] w-1/4 bg-foreground/10" />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="px-5 py-10 text-center font-sans text-sm text-foreground/65">
        Nothing matches <span className="font-medium text-foreground">{query}</span>.
      </p>
    );
  }

  // Where each group starts in the flat order the arrow keys walk. Computed
  // rather than counted with a mutable cursor during render - a variable
  // reassigned mid-render is exactly what the compiler cannot reason about,
  // and with at most a handful of groups the slice costs nothing.
  const groupStart = groups.map((_, i) =>
    groups.slice(0, i).reduce((total, g) => total + g.hits.length, 0)
  );

  return (
    <div className="flex flex-col">
      {groups.map((group, groupIndex) => (
        <section key={group.key}>
          <h3 className="sticky top-0 z-10 border-y border-foreground/15 bg-secondary px-5 py-2 font-mono text-[0.52rem] font-bold uppercase tracking-[0.2em] text-orange-ink">
            {group.label}
          </h3>
          <ul>
            {group.hits.map((hit, hitIndex) => {
              const index = groupStart[groupIndex] + hitIndex;
              const active = index === activeIndex;

              return (
                <li key={`${group.key}-${hit.id}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(hit)}
                    onMouseEnter={() => onHover(index)}
                    aria-selected={active}
                    role="option"
                    className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors ${
                      active ? "bg-orange text-[#0E0E0D]" : "hover:bg-foreground/[0.05]"
                    }`}
                  >
                    {hit.imageUrl ? (
                      <Image
                        src={hit.imageUrl}
                        alt=""
                        width={24}
                        height={24}
                        className="h-7 w-7 shrink-0 border border-foreground/20 object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center border border-foreground/25 bg-secondary font-mono text-[0.58rem] font-bold text-foreground/70"
                      >
                        {hit.title.replace(/^@/, "").charAt(0).toUpperCase()}
                      </span>
                    )}

                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-display text-[1.05rem] leading-snug">
                        {hit.title}
                      </span>
                      {hit.subtitle && (
                        <span className={`truncate font-mono text-[0.55rem] uppercase tracking-[0.1em] ${active ? "text-[#0E0E0D]/70" : "text-foreground/60"}`}>
                          {hit.subtitle}
                        </span>
                      )}
                    </span>

                    {active && (
                      <CornerDownLeft
                        aria-hidden
                        className="h-3.5 w-3.5 shrink-0 text-[#0E0E0D]"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default NavSearchResults;
