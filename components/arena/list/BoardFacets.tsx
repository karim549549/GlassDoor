"use client";

import Link from "next/link";
import { domainLabel } from "@/lib/arena/taxonomy";
import { timeUntil } from "./ArenaRow";
import type { ArenaStatusFilter } from "@/lib/arena/schema";

/**
 * What the board is, above the board itself.
 *
 * The page was a masthead, a filter bar, and rows - correct, and thin. These
 * are the numbers that make it feel like a board rather than a query result,
 * and none of them is decoration: the status counts are the rail restated with
 * quantities, the domain chips are one-click filters that also show the spread
 * of what gets built here, and the deadline is the reason to act today.
 *
 * All of it comes from aggregates computed once on the server - see
 * `getBoardFacets`. Nothing here costs a row.
 */

export interface BoardFacetData {
  open: number;
  live: number;
  finished: number;
  total: number;
  domains: { domain: string; count: number }[];
  /** ISO, or null when nothing is scheduled to close. */
  nextDeadline: string | null;
}

interface BoardFacetsProps {
  facets: BoardFacetData;
  now: Date;
  activeStatus: ArenaStatusFilter;
  activeDomain: string;
  onStatus: (status: ArenaStatusFilter) => void;
  onDomain: (domain: string) => void;
}

const STATS: { key: ArenaStatusFilter; label: string; hint: string }[] = [
  { key: "open", label: "Open now", hint: "you can enter these" },
  { key: "live", label: "Running", hint: "being built right now" },
  { key: "finished", label: "Finished", hint: "read what they made" },
];

export function BoardFacets({
  facets,
  now,
  activeStatus,
  activeDomain,
  onStatus,
  onDomain,
}: BoardFacetsProps) {
  const closesIn = facets.nextDeadline ? timeUntil(new Date(facets.nextDeadline), now) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Three numbers, each also a filter. A stat you cannot act on is a
          decoration; these set the rail. */}
      <div className="grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-3">
        {STATS.map((stat) => {
          const count = facets[stat.key as "open" | "live" | "finished"];
          const active = activeStatus === stat.key;

          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => onStatus(active ? "all" : stat.key)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-1 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange ${
                active ? "bg-orange text-[#0E0E0D]" : "bg-card hover:bg-foreground/5"
              }`}
            >
              <span
                className={`font-display text-[1.9rem] leading-none tabular-nums ${
                  active ? "text-[#0E0E0D]" : "text-orange-ink"
                }`}
              >
                {count.toLocaleString()}
              </span>
              <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em]">
                {stat.label}
              </span>
              <span
                className={`font-mono text-[0.52rem] uppercase tracking-[0.12em] ${
                  active ? "text-[#0E0E0D]/70" : "text-foreground/60"
                }`}
              >
                {stat.hint}
              </span>
            </button>
          );
        })}
      </div>

      {closesIn && (
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground/70">
          Next entry closes in{" "}
          <span className="font-bold text-orange-ink">{closesIn}</span>
        </p>
      )}

      {facets.domains.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-foreground/70">
            What gets built here
          </span>
          <ul className="flex flex-wrap gap-2">
            {facets.domains.map(({ domain, count }) => {
              const active = activeDomain === domain;
              return (
                <li key={domain}>
                  <button
                    type="button"
                    onClick={() => onDomain(active ? "" : domain)}
                    aria-pressed={active}
                    className={`flex items-baseline gap-2 border px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange ${
                      active
                        ? "border-orange bg-orange text-[#0E0E0D]"
                        : "border-foreground/25 bg-card text-foreground/80 hover:border-orange-ink/60 hover:text-foreground"
                    }`}
                  >
                    {domainLabel(domain) ?? domain}
                    <span
                      className={`tabular-nums font-bold ${
                        active ? "text-[#0E0E0D]/70" : "text-orange-ink"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * The supply-side ask, at the foot of the board.
 *
 * PRD 1.3: the community supplies the briefs, and `/arena/create` is the core
 * loop. Someone who scrolled a whole board without entering anything is
 * exactly the person who should be asked to write one - they have just read
 * everything on offer and found nothing they wanted.
 */
export function HostPrompt() {
  return (
    <div className="flex flex-col items-start gap-4 border border-foreground/15 bg-card p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
      <div className="max-w-xl">
        <h2 className="font-display text-[1.35rem] italic leading-tight text-foreground">
          Nothing you fancy?
        </h2>
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-foreground/70">
          Anyone can post a brief. Write the one you wanted to find, set the
          clock, and see who turns up.
        </p>
      </div>
      <Link
        href="/arena/create"
        className="shrink-0 border-2 border-orange bg-orange px-5 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#0E0E0D] shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Write a brief
      </Link>
    </div>
  );
}

export default BoardFacets;
