import type { Prisma } from "@prisma/client";
import type { ArenaStatusFilter } from "@/lib/arena/schema";

export const ARENA_STATUS = [
  "DRAFT",
  "SCHEDULED",
  "REGISTRATION_OPEN",
  "IDEA_PHASE",
  "IMPLEMENTATION_PHASE",
  "UNDER_JUDGING",
  "COMPLETED",
  "CANCELED",
] as const;

export type ArenaStatus = (typeof ARENA_STATUS)[number];

/**
 * The minimum shape `deriveArenaStatus` needs. Deliberately structural rather
 * than the Prisma `Arena` type so it accepts narrow list-page `select` rows,
 * full detail rows, and plain objects in tests that never touch a database.
 */
export interface ArenaPhaseWindows {
  publishedAt: Date | null;
  canceledAt: Date | null;
  resultsPublishedAt: Date | null;
  registrationStart: Date;
  registrationEnd: Date;
  ideaPhaseStart: Date;
  ideaPhaseEnd: Date;
  implPhaseStart: Date;
  implPhaseEnd: Date;
}

/**
 * Derives an arena's status from its phase timestamps instead of reading a
 * stored column. The old `Arena.status` column was written once at creation
 * and never updated by anything (there is no scheduler in this repo), so an
 * arena that ended a year ago still reported itself as REGISTRATION_OPEN.
 *
 * `now` is a required parameter and this function MUST NOT call `Date.now()`
 * or `new Date()` internally. The status badge is rendered during SSR and then
 * re-rendered on the client; if the function read the clock itself, the two
 * renders would read it at different instants and every arena sitting near a
 * phase boundary would produce a hydration mismatch. Callers pass a single
 * `now` captured once per render pass.
 *
 * Zero-width windows fall through by construction: a 90-minute REP format sets
 * `ideaPhaseStart === ideaPhaseEnd === registrationEnd`, which makes rule 6's
 * `now < ideaPhaseEnd` guard false at every instant, so IDEA_PHASE is simply
 * never reported for that format. No format-specific branching is needed here
 * or anywhere else — collapse the window and the phase disappears.
 */
export function deriveArenaStatus(a: ArenaPhaseWindows, now: Date): ArenaStatus {
  // 1-3: lifecycle flags outrank anything the clock says.
  if (a.canceledAt) return "CANCELED";
  if (a.resultsPublishedAt) return "COMPLETED";
  if (!a.publishedAt) return "DRAFT";

  // 4-8: the timeline, latest phase first.
  if (now >= a.implPhaseEnd) return "UNDER_JUDGING";
  if (now >= a.implPhaseStart) return "IMPLEMENTATION_PHASE";
  if (now >= a.ideaPhaseStart && now < a.ideaPhaseEnd) return "IDEA_PHASE";
  if (now >= a.registrationStart && now < a.registrationEnd) return "REGISTRATION_OPEN";
  if (now < a.registrationStart) return "SCHEDULED";

  // 9: reachable only when the phases leave a gap (e.g. registration closed but
  // the idea phase has not opened yet). Report the work-in-progress state
  // rather than inventing a "between phases" status participants can't act on.
  return "IMPLEMENTATION_PHASE";
}

/**
 * The lifecycle timestamp columns are added by the migration chunk that drops
 * `Arena.status`; until that migration lands the generated Prisma client has
 * no `publishedAt`/`canceledAt`/`resultsPublishedAt` fields, so the fragments
 * below are asserted into `ArenaWhereInput` rather than structurally checked.
 * Drop this helper once the migration is applied so the compiler checks them.
 */
function asArenaWhere(where: Record<string, unknown>): Prisma.ArenaWhereInput {
  return where as Prisma.ArenaWhereInput;
}

/** An arena that is live to the public: published and not called off. */
const PUBLISHED_AND_LIVE = { publishedAt: { not: null }, canceledAt: null };

/**
 * SQL-side equivalent of `deriveArenaStatus` for list filtering, so the list
 * page keeps filtering in the database once the `status` column is gone
 * instead of over-fetching and filtering in JS.
 *
 * `now` is a parameter here for the same reason it is in `deriveArenaStatus`:
 * one instant per request, shared by the query and by any status badge
 * rendered from its rows, so the two can never disagree.
 *
 * NOTE: `ARENA_STATUS_FILTERS` in `lib/arena/schema.ts` still lacks a
 * "judging" option (arenas past `implPhaseEnd` with no results published yet).
 * When that option is added there, this function needs a matching branch:
 * `{ ...PUBLISHED_AND_LIVE, implPhaseEnd: { lte: now }, resultsPublishedAt: null }`.
 * The switch is exhaustive over `ArenaStatusFilter`, so adding the option
 * without the branch is a type error rather than a silent empty filter.
 */
export function arenaStatusWhere(
  filter: ArenaStatusFilter,
  now: Date
): Prisma.ArenaWhereInput {
  switch (filter) {
    case "all":
      return {};
    case "open":
      return asArenaWhere({
        ...PUBLISHED_AND_LIVE,
        registrationStart: { lte: now },
        registrationEnd: { gt: now },
      });
    // Everything between registration closing and submissions locking: the
    // planning window and the build window both. A reader does not care which
    // of the two an arena is in - they care that it is running and they cannot
    // join it.
    case "live":
      return asArenaWhere({
        ...PUBLISHED_AND_LIVE,
        registrationEnd: { lte: now },
        implPhaseEnd: { gt: now },
      });
    // Past its build window.
    //
    // Deliberately NOT `resultsPublishedAt: { not: null }`, which is what this
    // used to be. Nothing in the codebase can create a judge assignment, so no
    // arena has ever had results published - and under the old rule "finished"
    // matched nothing while every ended arena fell through every filter and
    // appeared only under "all". Judging is optional (PRD 7.1a): an arena that
    // has run is finished whether or not anyone scored it.
    case "finished":
      return asArenaWhere({
        ...PUBLISHED_AND_LIVE,
        implPhaseEnd: { lte: now },
      });
  }
}
