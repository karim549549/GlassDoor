import type { ArenaFormat } from "@prisma/client";

/**
 * Format rules for the three competition formats.
 *
 * WHY THIS IS CODE AND NOT A SET OF DB CHECK CONSTRAINTS
 *
 * Everything in `FORMAT_RULES` is *product policy*, not a data-integrity
 * invariant. "REP runs 60-180 minutes", "LIVE is gated at 1600 rating", "ARENA
 * needs two judges" are numbers the product will move — after the first season
 * of REP we will know whether 90 minutes is the right length, and LIVE's gate
 * has to track the actual rating distribution as the population grows or the
 * flagship either fills with everyone or with nobody.
 *
 * Expressed as `CHECK` constraints those edits become schema migrations: a
 * migration file, a review, a deploy, and an irreversible change to rows that
 * were valid under the old policy. Expressed here they are a one-line diff, and
 * arenas created under last month's bounds keep whatever they were created
 * with. The database's job is to store six timestamps; deciding which
 * arrangements of them the product is willing to sell is this module's job.
 *
 * The genuine invariants — column types, nullability, foreign keys — stay in
 * `prisma/schema/arena/arena.prisma` where they belong.
 *
 * PURITY
 *
 * Every function here is pure and deterministic in its arguments. In
 * particular nothing calls `Date.now()` or `new Date()`, the same rule
 * `deriveArenaStatus` follows. `validateArenaTimeline` deliberately takes no
 * `now` parameter at all: a timeline is well-formed or malformed as a shape,
 * independent of when anyone asks. Whether an arena has *started* is
 * `deriveArenaStatus`'s question, not this module's.
 */

/** How submissions in a format are scored. */
export type JudgingMode = "AUTO" | "HUMAN";

export interface FormatRules {
  /** Human-facing name for the format. */
  label: string;
  /** Short line explaining what the format is for, safe to render in UI. */
  tagline: string;
  /**
   * Allowed length of the *implementation* window, in minutes. Registration
   * and ideation sit outside this — they are scheduling overhead, not the
   * contest.
   */
  durationMinutes: { min: number; max: number };
  /**
   * AUTO formats are scored by `lib/runner` against fixed test cases with no
   * human in the loop; HUMAN formats go through the rubric/judging pipeline.
   */
  judging: JudgingMode;
  /** Whether entry is restricted by the entrant's rating. */
  ratingGated: boolean;
  /**
   * Rating floor applied when the arena leaves `minRatingToEnter` null. Only
   * meaningful for a rating-gated format — a gated format that fell back to
   * "no floor" would be silently ungated, which defeats the point of the gate.
   */
  defaultMinRatingToEnter: number | null;
  /**
   * Default for `Arena.minJudgesPerSubmission`. Zero for AUTO formats: there
   * are no human judges to require, and the schema default of 2 would make
   * every REP submission look permanently under-judged.
   */
  defaultMinJudgesPerSubmission: number;
  /**
   * Whether finishing produces a Proof Packet. Reserved for formats where the
   * work is long enough and judged closely enough for the artifact to mean
   * something — a 90-minute auto-graded sprint is not portfolio evidence.
   */
  issuesProofPacket: boolean;
}

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 60 * 24;
const MS_PER_MINUTE = 60_000;

export const FORMAT_RULES = {
  REP: {
    label: "Rep",
    tagline: "Weekly 90-minute sprint, auto-judged, open to everyone.",
    durationMinutes: { min: 1 * MINUTES_PER_HOUR, max: 3 * MINUTES_PER_HOUR },
    judging: "AUTO",
    ratingGated: false,
    defaultMinRatingToEnter: null,
    defaultMinJudgesPerSubmission: 0,
    issuesProofPacket: false,
  },
  LIVE: {
    label: "Live",
    tagline: "Monthly filmed flagship. Five hours, human-judged, rating-gated.",
    durationMinutes: { min: 4 * MINUTES_PER_HOUR, max: 8 * MINUTES_PER_HOUR },
    judging: "HUMAN",
    ratingGated: true,
    defaultMinRatingToEnter: 1600,
    defaultMinJudgesPerSubmission: 3,
    issuesProofPacket: true,
  },
  ARENA: {
    label: "Arena",
    tagline: "Multi-week build. Human-judged, depth over speed.",
    durationMinutes: { min: 7 * MINUTES_PER_DAY, max: 21 * MINUTES_PER_DAY },
    judging: "HUMAN",
    ratingGated: false,
    defaultMinRatingToEnter: null,
    defaultMinJudgesPerSubmission: 2,
    issuesProofPacket: true,
  },
} as const satisfies Record<ArenaFormat, FormatRules>;

export function getFormatRules(format: ArenaFormat): FormatRules {
  return FORMAT_RULES[format];
}

/**
 * The result of a policy check. A rejection always carries a reason written
 * for the person who tripped it, not for a log file — these strings surface in
 * form errors and API responses.
 */
export type FormatCheck = { ok: true } | { ok: false; reason: string };

const OK: FormatCheck = { ok: true };

function reject(reason: string): FormatCheck {
  return { ok: false, reason };
}

/**
 * The six phase timestamps. Structural rather than the Prisma `Arena` type for
 * the same reason `ArenaPhaseWindows` is: it has to accept narrow `select`
 * rows, unsaved form payloads, and plain objects in tests. `ArenaPhaseWindows`
 * from `lib/arena/status.ts` is assignable to this — it is a superset.
 */
export interface ArenaTimeline {
  registrationStart: Date;
  registrationEnd: Date;
  ideaPhaseStart: Date;
  ideaPhaseEnd: Date;
  implPhaseStart: Date;
  implPhaseEnd: Date;
}

/**
 * The phases in the order they must occur. Adjacent pairs are compared with
 * `<=`, NOT `<`.
 *
 * The non-strict comparison is load-bearing, not laziness. REP has no separate
 * ideation stage, so a REP arena sets
 * `ideaPhaseStart === ideaPhaseEnd === registrationEnd` — a zero-width window
 * that `deriveArenaStatus` already handles by letting IDEA_PHASE simply never
 * be reported. Requiring a strict increase here would make every REP arena
 * unconstructible, and REP is the weekly retention loop.
 */
const PHASE_ORDER = [
  "registrationStart",
  "registrationEnd",
  "ideaPhaseStart",
  "ideaPhaseEnd",
  "implPhaseStart",
  "implPhaseEnd",
] as const satisfies readonly (keyof ArenaTimeline)[];

/**
 * Validates a timeline against a format's duration bounds and against the
 * required ordering of the six phase timestamps.
 *
 * The ordering half fills a real hole: `arenaSchema` in `lib/arena/schema.ts`
 * only refines the registration pair, so nothing today stops an arena being
 * created whose implementation phase ends before registration opens. Such an
 * arena is not merely odd — `deriveArenaStatus` reads it as UNDER_JUDGING from
 * the moment it is published, so it can never be entered.
 */
export function validateArenaTimeline(
  format: ArenaFormat,
  timeline: ArenaTimeline
): FormatCheck {
  for (const field of PHASE_ORDER) {
    if (Number.isNaN(timeline[field].getTime())) {
      return reject(`${field} is not a valid date.`);
    }
  }

  for (let i = 0; i < PHASE_ORDER.length - 1; i += 1) {
    const earlier = PHASE_ORDER[i];
    const later = PHASE_ORDER[i + 1];
    if (timeline[earlier].getTime() > timeline[later].getTime()) {
      return reject(
        `${later} (${timeline[later].toISOString()}) must not be before ` +
          `${earlier} (${timeline[earlier].toISOString()}). ` +
          `Phases run in order: ${PHASE_ORDER.join(" -> ")}.`
      );
    }
  }

  const rules = getFormatRules(format);
  const durationMinutes =
    (timeline.implPhaseEnd.getTime() - timeline.implPhaseStart.getTime()) / MS_PER_MINUTE;

  if (durationMinutes < rules.durationMinutes.min) {
    return reject(
      `${rules.label} runs for at least ${rules.durationMinutes.min} minutes; ` +
        `this implementation window is ${durationMinutes}.`
    );
  }

  if (durationMinutes > rules.durationMinutes.max) {
    return reject(
      `${rules.label} runs for at most ${rules.durationMinutes.max} minutes; ` +
        `this implementation window is ${durationMinutes}.`
    );
  }

  return OK;
}

export interface EntryCheckInput {
  format: ArenaFormat;
  /**
   * The arena's own floor, overriding the format default when set. Null means
   * "use whatever the format says", which for a gated format is its default
   * floor and for an ungated one is no floor at all.
   */
  minRatingToEnter?: number | null;
  /**
   * The entrant's rating in the arena's domain. Null/undefined means unrated —
   * a new account, or one that has never competed in this domain.
   */
  userRating?: number | null;
}

/**
 * Decides whether a user may enter an arena of this format.
 *
 * LIVE is the only format gated by default, and the gate is the product, not a
 * safety rail: LIVE is filmed and scarce, and its scarcity is what makes
 * placing in one worth anything. An unrated account is refused rather than
 * waved through — the whole point of the gate is that entrants have a
 * demonstrated rating, and "no rating yet" is not one.
 *
 * An ungated format still honours an explicit `minRatingToEnter`, so an
 * individual ARENA can opt into a floor without the format doing so globally.
 */
export function canEnter({
  format,
  minRatingToEnter,
  userRating,
}: EntryCheckInput): FormatCheck {
  const rules = getFormatRules(format);
  const threshold = minRatingToEnter ?? rules.defaultMinRatingToEnter;

  if (threshold === null || threshold === undefined) return OK;

  if (userRating === null || userRating === undefined) {
    return reject(
      `${rules.label} requires a rating of at least ${threshold}. ` +
        `Compete in a Rep arena first to earn one.`
    );
  }

  if (userRating < threshold) {
    return reject(
      `${rules.label} requires a rating of at least ${threshold}; yours is ${Math.round(userRating)}.`
    );
  }

  return OK;
}
