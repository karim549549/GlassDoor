/**
 * Timeline validation: is this arrangement of six timestamps well-formed?
 *
 * WHAT THIS USED TO BE, AND WHY IT IS GONE
 *
 * This module used to hold `FORMAT_RULES` - three fixed formats (REP, LIVE,
 * ARENA) each with hard duration bounds, a judging mode, a rating gate and a
 * default judge count. It was wrong in a way that only showed up when the
 * create form got a working schedule picker: `ARENA` is the default format and
 * required an implementation window of **7 to 21 days**, so a probe against the
 * live API came back
 *
 *   "Arena runs for at least 10080 minutes; this implementation window is 240."
 *
 * The create page's own default - the reference show's 30 minutes to plan and
 * 4 hours to build - could not be submitted. The form was unusable, and the
 * rule that made it unusable was invented, not specified: nothing in the PRD
 * defines REP, LIVE or ARENA, and `LIVE`'s own tagline described a "monthly
 * filmed flagship" for a show the PRD explicitly retracted.
 *
 * The product is a **marketplace**. Whoever creates an arena sets its clock -
 * two hours or two weeks - so a platform-wide minimum duration is not policy
 * the product wants. See AGENTS.md: durations are per-arena data, never a
 * platform claim.
 *
 * WHAT SURVIVES
 *
 * The ordering check, which was the valuable half and fills a real hole:
 * `arenaSchema` only refines the registration pair, so without this an arena
 * could be created whose implementation phase ends before registration opens.
 * Such an arena is not merely odd - `deriveArenaStatus` reads it as
 * UNDER_JUDGING from the moment it is published, so it can never be entered.
 *
 * Plus two integrity guards that are about typos rather than product policy: a
 * build window has to be longer than zero, and shorter than a year.
 *
 * PURITY
 *
 * Nothing here reads the clock, the same rule `deriveArenaStatus` follows.
 * `validateArenaTimeline` deliberately takes no `now`: a timeline is
 * well-formed or malformed as a shape, independent of when anyone asks.
 * Whether an arena has *started* is `deriveArenaStatus`'s question.
 */

const MS_PER_MINUTE = 60_000;
const MINUTES_PER_DAY = 24 * 60;

/**
 * Outer bounds on the build window. Deliberately absurd on both ends: these
 * catch a mistyped date, not a host with unusual taste. A fifteen-minute
 * challenge and a six-month one are both things this platform should host.
 */
export const BUILD_WINDOW_MIN_MINUTES = 1;
export const BUILD_WINDOW_MAX_MINUTES = 365 * MINUTES_PER_DAY;

/**
 * The result of a check. A rejection always carries a reason written for the
 * person who tripped it, not for a log file - these strings surface in form
 * errors and API responses.
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
 * from `lib/arena/status.ts` is assignable to this - it is a superset.
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
 * The non-strict comparison is load-bearing. A host may want no separate
 * planning stage at all, which means
 * `ideaPhaseStart === ideaPhaseEnd === registrationEnd` - a zero-width window
 * `deriveArenaStatus` already handles by letting IDEA_PHASE simply never be
 * reported. Requiring a strict increase would make that arena unconstructible.
 */
const PHASE_ORDER = [
  "registrationStart",
  "registrationEnd",
  "ideaPhaseStart",
  "ideaPhaseEnd",
  "implPhaseStart",
  "implPhaseEnd",
] as const satisfies readonly (keyof ArenaTimeline)[];

export function validateArenaTimeline(timeline: ArenaTimeline): FormatCheck {
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

  const buildMinutes =
    (timeline.implPhaseEnd.getTime() - timeline.implPhaseStart.getTime()) / MS_PER_MINUTE;

  if (buildMinutes < BUILD_WINDOW_MIN_MINUTES) {
    return reject("There has to be time to build in: give the build window at least a minute.");
  }

  if (buildMinutes > BUILD_WINDOW_MAX_MINUTES) {
    return reject("That build window is over a year long - check the dates.");
  }

  return OK;
}
