"use client";

import { Search, X } from "lucide-react";
import { openSearchDialog } from "@/lib/client/search-dialog";
import {
  ARENA_PLACE_FILTERS,
  ARENA_ENTRY_FILTERS,
  ARENA_DIFFICULTY_VALUES,
  ARENA_SORT_OPTIONS,
  type ArenaStatusFilter,
  type ArenaPlaceFilter,
  type ArenaEntryFilter,
  type ArenaDifficultyFilter,
  type ArenaSortOption,
  type ArenaTabScope,
} from "@/lib/arena/schema";
import { ARENA_DIFFICULTIES } from "@/lib/arena/taxonomy";

/**
 * The board's controls.
 *
 * Multi-select, and the chips are why. A `<select>` forces one value, so
 * "novice or intermediate" was unaskable and the vocabulary needed an "all"
 * option that meant the absence of a choice. A set says it directly: nothing
 * picked and everything picked both mean no restriction, and neither needs a
 * word of its own.
 *
 * Status is not here - the stat cards above are the status control, and this
 * carried a second copy of them until recently. Free text is not here either;
 * it opens the site-wide dialog, which also finds people.
 */

const PLACE_LABEL: Record<ArenaPlaceFilter, string> = {
  online: "Online",
  in_person: "In person",
};

const ENTRY_LABEL: Record<ArenaEntryFilter, string> = {
  solo: "Solo",
  team: "Teams",
};

const DIFFICULTY_LABEL = Object.fromEntries(
  ARENA_DIFFICULTIES.map((d) => [d.value, d.label])
) as Record<ArenaDifficultyFilter, string>;

const SORT_LABEL: Record<ArenaSortOption, string> = {
  // Reads "closing soonest" on the open list and "most recent" everywhere
  // else, because that is what the ordering actually does - see the
  // `closingDirection` note in lib/arena/service.ts.
  closing: "Most relevant",
  newest: "Newest",
  prize: "Biggest prize",
  entrants: "Most entered",
  title: "A–Z",
};

export interface ArenaFilterState {
  status: ArenaStatusFilter;
  place: ArenaPlaceFilter[];
  entry: ArenaEntryFilter[];
  difficulty: ArenaDifficultyFilter[];
  prized: boolean;
  sortBy: ArenaSortOption;
  tab: ArenaTabScope;
}

export interface ArenaFilterBarProps {
  value: ArenaFilterState;
  onChange: (patch: Partial<ArenaFilterState>) => void;
  onReset: () => void;
  /** Null when signed out - the "Mine" scope is hidden rather than disabled. */
  myCount: number | null;
}

/** Add or remove one member of a filter set. */
function toggle<T extends string>(current: T[], value: T): T[] {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange ${
        active
          ? "border-orange bg-orange font-bold text-[#0E0E0D]"
          : "border-foreground/25 bg-card text-foreground/80 hover:border-orange-ink/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/** A labelled row of chips. */
function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 flex flex-wrap items-center gap-2 border-0 p-0">
      <legend className="contents">
        <span className="mr-1 font-mono text-[0.52rem] font-bold uppercase tracking-[0.18em] text-foreground/55">
          {label}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

export function ArenaFilterBar({
  value,
  onChange,
  onReset,
  myCount,
}: ArenaFilterBarProps) {
  const isFiltered =
    value.status !== "all" ||
    value.place.length > 0 ||
    value.entry.length > 0 ||
    value.difficulty.length > 0 ||
    value.prized;

  return (
    <div className="flex flex-col gap-4">
      {/* Scope only. Status lives in the stat cards above - it was here as
          well, which was the same control rendered twice. */}
      {myCount !== null && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-foreground/15">
          {(["all", "my"] as ArenaTabScope[]).map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => onChange({ tab: scope })}
              aria-pressed={value.tab === scope}
              className={`border-b-2 px-3 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange ${
                value.tab === scope
                  ? "border-orange text-orange-ink"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {scope === "all" ? "Every arena" : `Mine (${myCount})`}
            </button>
          ))}
        </div>
      )}

      {/* A button dressed as a field, not a field. The board used to filter its
          own list from a text box here while the nav had a dialog that searched
          arenas - two searches, different scopes, different answers to the same
          words. This opens the one dialog, which also finds people. */}
      <button
        type="button"
        onClick={() => openSearchDialog()}
        className="flex w-full items-center gap-2 border border-foreground/20 bg-secondary px-3 py-2.5 text-left font-sans text-sm text-foreground/45 transition-colors hover:border-foreground/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        <Search aria-hidden className="h-3.5 w-3.5 shrink-0 text-foreground/50" />
        <span className="flex-1 truncate">Search arenas and people</span>
        <kbd className="hidden shrink-0 border border-foreground/20 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider text-foreground/50 sm:inline">
          &#8984;K
        </kbd>
      </button>

      <div className="flex flex-col gap-3">
        <ChipGroup label="Difficulty">
          {ARENA_DIFFICULTY_VALUES.map((d) => (
            <Chip
              key={d}
              active={value.difficulty.includes(d)}
              onClick={() => onChange({ difficulty: toggle(value.difficulty, d) })}
            >
              {DIFFICULTY_LABEL[d]}
            </Chip>
          ))}
        </ChipGroup>

        <ChipGroup label="Where">
          {ARENA_PLACE_FILTERS.map((p) => (
            <Chip
              key={p}
              active={value.place.includes(p)}
              onClick={() => onChange({ place: toggle(value.place, p) })}
            >
              {PLACE_LABEL[p]}
            </Chip>
          ))}
        </ChipGroup>

        <ChipGroup label="Entry">
          {ARENA_ENTRY_FILTERS.map((e) => (
            <Chip
              key={e}
              active={value.entry.includes(e)}
              onClick={() => onChange({ entry: toggle(value.entry, e) })}
            >
              {ENTRY_LABEL[e]}
            </Chip>
          ))}
          <Chip active={value.prized} onClick={() => onChange({ prized: !value.prized })}>
            Prize money
          </Chip>
        </ChipGroup>
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 self-start font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground/65 transition-colors hover:text-orange-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <X className="h-3 w-3" />
          Clear filters
        </button>
      )}
    </div>
  );
}

/**
 * The count and the sort, beside the list rather than in the rail.
 *
 * They describe the result; the rail sets it. Keeping them here is also what
 * lets the first row sit near the top of the screen - every control that moved
 * left is vertical space the list got back.
 */
export function BoardToolbar({
  total,
  sortBy,
  onSort,
}: {
  total: number;
  sortBy: ArenaSortOption;
  onSort: (next: ArenaSortOption) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <p
        aria-live="polite"
        className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] tabular-nums text-orange-ink"
      >
        {total === 1 ? "1 arena" : `${total.toLocaleString()} arenas`}
      </p>

      <label className="flex items-center gap-2">
        <span className="font-mono text-[0.52rem] font-bold uppercase tracking-[0.18em] text-foreground/55">
          Sort
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value as ArenaSortOption)}
          className="border border-foreground/25 bg-card px-2.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-foreground transition-colors focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange/30"
        >
          {ARENA_SORT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default ArenaFilterBar;
