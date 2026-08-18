"use client";

import Link from "next/link";
import { timeUntil } from "./ArenaRow";
import type { ArenaStatusFilter } from "@/lib/arena/schema";

/**
 * What the board is, above the board itself.
 *
 * The page was a masthead, a filter bar, and rows - correct, and thin. These
 * are the numbers that make it feel like a board rather than a query result,
 * and none of them is decoration: the status counts are the rail restated with
 * quantities, and the deadline is the reason to act today. A row of domain
 * chips sat here too, until domains were removed from the product.
 *
 * All of it comes from aggregates computed once on the server - see
 * `getBoardFacets`. Nothing here costs a row.
 */

export interface BoardFacetData {
  open: number;
  live: number;
  finished: number;
  total: number;
  /** ISO, or null when nothing is scheduled to close. */
  nextDeadline: string | null;
}

interface BoardFacetsProps {
  facets: BoardFacetData;
  now: Date;
  activeStatus: ArenaStatusFilter;
  onStatus: (status: ArenaStatusFilter) => void;
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
  onStatus,
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
export function HostPrompt({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "border-2 border-orange bg-orange/10 p-4"
          : "flex flex-col items-start gap-4 border border-foreground/15 bg-card p-6 sm:flex-row sm:items-center sm:justify-between md:p-8"
      }
    >
      <div className={compact ? "" : "max-w-xl"}>
        <h2
          className={`font-display italic leading-tight text-foreground ${
            compact ? "text-[1.1rem]" : "text-[1.35rem]"
          }`}
        >
          Nothing you fancy?
        </h2>
        <p
          className={`mt-1.5 font-sans leading-relaxed text-foreground/75 ${
            compact ? "text-[0.8rem]" : "text-sm"
          }`}
        >
          Anyone can post a brief. Write the one you wanted to find, set the
          clock, and see who turns up.
        </p>
      </div>
      <Link
        href="/arena/create"
        className={`border-2 border-orange bg-orange font-mono font-bold uppercase tracking-[0.16em] text-[#0E0E0D] shadow-[3px_3px_0_0_var(--foreground)] transition-all hover:shadow-none active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
          compact
            ? "mt-3 block px-4 py-2 text-center text-[0.58rem]"
            : "shrink-0 px-5 py-2.5 text-[0.6rem]"
        }`}
      >
        Write a brief
      </Link>
    </div>
  );
}

export default BoardFacets;
