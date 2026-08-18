"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import {
  ARENA_PLACE_FILTERS,
  ARENA_ENTRY_FILTERS,
  ARENA_SORT_OPTIONS,
  type ArenaStatusFilter,
  type ArenaPlaceFilter,
  type ArenaEntryFilter,
  type ArenaSortOption,
  type ArenaTabScope,
} from "@/lib/arena/schema";
import { ARENA_DIFFICULTIES } from "@/lib/arena/taxonomy";

/**
 * The board's controls.
 *
 * This replaces a 249-line sidebar that let a reader filter by status, by
 * "access" - a filter *for* arenas you cannot join - and by tag, and sort by
 * newest, oldest, A-Z or team count. It could not filter by domain,
 * difficulty, online-versus-in-person, or prize: the four things that actually
 * decide whether someone enters, two of which only became real data once the
 * create form started asking for them.
 *
 * Status is promoted out of a `<select>` into the primary rail, because it is
 * the axis every visitor sorts on first: what can I enter, what is running,
 * what did I miss.
 */

const PLACE_LABEL: Record<ArenaPlaceFilter, string> = {
  all: "Anywhere",
  online: "Online",
  in_person: "In person",
};

const ENTRY_LABEL: Record<ArenaEntryFilter, string> = {
  all: "Solo or team",
  solo: "Solo",
  team: "Teams",
};

const SORT_LABEL: Record<ArenaSortOption, string> = {
  // Reads "closing soonest" on the open list and "most recent" everywhere
  // else, because that is what the ordering actually does - see the
  // `closingDirection` note in lib/arena/service.ts. A label that says
  // "closing soonest" over a list of arenas that closed two months ago is
  // worse than no label.
  closing: "Most relevant",
  newest: "Newest",
  prize: "Biggest prize",
  entrants: "Most entered",
  title: "A–Z",
};

export interface ArenaFilterState {
  status: ArenaStatusFilter;
  place: ArenaPlaceFilter;
  entry: ArenaEntryFilter;
  difficulty: string;
  prized: boolean;
  sortBy: ArenaSortOption;
  search: string;
  tab: ArenaTabScope;
}

export interface ArenaFilterBarProps {
  value: ArenaFilterState;
  onChange: (patch: Partial<ArenaFilterState>) => void;
  onReset: () => void;
  /** Null when signed out - the "Mine" scope is hidden rather than disabled. */
  myCount: number | null;
  total: number;
}

const SELECT_CLASS =
  "border border-foreground/25 bg-card px-2.5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-foreground " +
  "focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange/30 transition-colors";

export function ArenaFilterBar({
  value,
  onChange,
  onReset,
  myCount,
  total,
}: ArenaFilterBarProps) {
  const id = useId();

  const isFiltered =
    value.status !== "all" ||
    value.place !== "all" ||
    value.entry !== "all" ||
    value.difficulty !== "" ||
    value.prized ||
    value.search !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* Scope only. Status lives in the stat cards above - it was here as
          well, which was the same control rendered twice. */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-foreground/15">
        {myCount !== null && (
          <>
            {(["all", "my"] as ArenaTabScope[]).map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => onChange({ tab: scope })}
                aria-pressed={value.tab === scope}
                className={`border-b-2 px-3 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange ${
                  value.tab === scope
                    ? "border-orange text-foreground"
                    : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {scope === "all" ? "Every arena" : `Mine (${myCount})`}
              </button>
            ))}
          </>
        )}

      </div>

      {/* Search + the four axes + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/50"
          />
          <input
            id={`${id}-search`}
            type="search"
            value={value.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search briefs"
            aria-label="Search arenas"
            className="w-full border border-foreground/20 bg-secondary py-2 pl-8 pr-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange/30 transition-colors"
          />
        </div>

        <label className="sr-only" htmlFor={`${id}-difficulty`}>
          Difficulty
        </label>
        <select
          id={`${id}-difficulty`}
          value={value.difficulty}
          onChange={(e) => onChange({ difficulty: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="">Any difficulty</option>
          {ARENA_DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor={`${id}-place`}>
          Place
        </label>
        <select
          id={`${id}-place`}
          value={value.place}
          onChange={(e) => onChange({ place: e.target.value as ArenaPlaceFilter })}
          className={SELECT_CLASS}
        >
          {ARENA_PLACE_FILTERS.map((p) => (
            <option key={p} value={p}>
              {PLACE_LABEL[p]}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor={`${id}-entry`}>
          Entry
        </label>
        <select
          id={`${id}-entry`}
          value={value.entry}
          onChange={(e) => onChange({ entry: e.target.value as ArenaEntryFilter })}
          className={SELECT_CLASS}
        >
          {ARENA_ENTRY_FILTERS.map((e) => (
            <option key={e} value={e}>
              {ENTRY_LABEL[e]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onChange({ prized: !value.prized })}
          aria-pressed={value.prized}
          className={`border px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange ${
            value.prized
              ? "border-orange bg-orange text-[#0E0E0D]"
              : "border-foreground/20 bg-card text-foreground hover:border-foreground/50"
          }`}
        >
          Prize money
        </button>

        <label className="sr-only" htmlFor={`${id}-sort`}>
          Sort
        </label>
        <select
          id={`${id}-sort`}
          value={value.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as ArenaSortOption })}
          className={SELECT_CLASS}
        >
          {ARENA_SORT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          aria-live="polite"
          className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] tabular-nums text-orange-ink"
        >
          {total === 1 ? "1 arena" : `${total.toLocaleString()} arenas`}
        </p>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground/65 transition-colors hover:text-orange-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default ArenaFilterBar;
