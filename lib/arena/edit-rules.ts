/**
 * What a host may still change once an arena has started.
 *
 * Separate from `service.ts` because that file is `server-only` and this is a
 * pure rule about six dates — the kind of thing that should be testable
 * without a database, and the kind that is wrong in a way nobody notices until
 * someone's entry disappears. Same reasoning as `lib/arena/authority.ts`.
 */

/** The six phase boundaries, in the order they occur. */
export const PHASE_FIELDS = [
  "registrationStart",
  "registrationEnd",
  "ideaPhaseStart",
  "ideaPhaseEnd",
  "implPhaseStart",
  "implPhaseEnd",
] as const;

export type PhaseField = (typeof PHASE_FIELDS)[number];

/** How each boundary is named to the host who just tried to move it. */
export const PHASE_LABELS: Record<PhaseField, string> = {
  registrationStart: "Registration opens",
  registrationEnd: "Registration closes",
  ideaPhaseStart: "Planning starts",
  ideaPhaseEnd: "Planning ends",
  implPhaseStart: "Build starts",
  implPhaseEnd: "Build ends",
};

export type ScheduleEditCheck = { ok: true } | { ok: false; error: string };

/**
 * A boundary that has already passed may move forward, never back.
 *
 * Moving one backwards rewrites what already happened: pull `registrationEnd`
 * behind now and everyone who entered in the interval joined an arena that -
 * by the only record of it - was closed at the time. Pushing it forward only
 * ever adds, which is the shape of a host extending a deadline, and hosts
 * legitimately want to do that.
 *
 * Boundaries still in the future are unconstrained. `arenaSchema` has already
 * checked that the six of them stay in order relative to each other, so this
 * only has to police the past.
 */
export function checkScheduleEdit(
  current: Record<PhaseField, Date>,
  next: Record<PhaseField, string>,
  now: Date
): ScheduleEditCheck {
  for (const field of PHASE_FIELDS) {
    const was = current[field];
    const willBe = new Date(next[field]);

    if (was > now) continue;
    if (willBe.getTime() === was.getTime()) continue;

    if (willBe < was) {
      return {
        ok: false,
        error: `"${PHASE_LABELS[field]}" has already passed and cannot be moved earlier.`,
      };
    }
  }

  return { ok: true };
}
