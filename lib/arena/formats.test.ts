import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateArenaTimeline,
  BUILD_WINDOW_MAX_MINUTES,
  type ArenaTimeline,
  type FormatCheck,
} from "./formats";

function assertOk(check: FormatCheck) {
  assert.equal(check.ok, true, check.ok ? "" : check.reason);
}

function assertRejected(check: FormatCheck, matching: RegExp) {
  assert.equal(check.ok, false);
  if (!check.ok) assert.match(check.reason, matching);
}

/** A well-formed timeline with a build window of `buildMinutes`. */
function timeline(buildMinutes: number, over: Partial<ArenaTimeline> = {}): ArenaTimeline {
  const base = new Date("2026-08-22T09:00:00.000Z").getTime();
  const at = (minutes: number) => new Date(base + minutes * 60_000);
  return {
    registrationStart: at(0),
    registrationEnd: at(60),
    ideaPhaseStart: at(60),
    ideaPhaseEnd: at(90),
    implPhaseStart: at(90),
    implPhaseEnd: at(90 + buildMinutes),
    ...over,
  };
}

test("any duration a host chooses is accepted", () => {
  // The rule this replaces required 7 to 21 days for the default format, which
  // made the create page's own default - 30 minutes to plan, 4 hours to build -
  // unsubmittable. Durations are the host's decision.
  assertOk(validateArenaTimeline(timeline(15)));
  assertOk(validateArenaTimeline(timeline(120)));
  assertOk(validateArenaTimeline(timeline(240)));
  assertOk(validateArenaTimeline(timeline(480)));
  assertOk(validateArenaTimeline(timeline(14 * 24 * 60)));
});

test("a zero-length build window is refused", () => {
  assertRejected(validateArenaTimeline(timeline(0)), /time to build/);
});

test("an absurd build window is refused as a typo", () => {
  assertRejected(
    validateArenaTimeline(timeline(BUILD_WINDOW_MAX_MINUTES + 1)),
    /over a year/
  );
  assertOk(validateArenaTimeline(timeline(BUILD_WINDOW_MAX_MINUTES)));
});

test("a zero-width planning window is allowed", () => {
  // A host may want no separate planning stage. deriveArenaStatus handles it by
  // never reporting IDEA_PHASE; a strict ordering check would make it
  // unconstructible.
  const noPlanning = timeline(240, {
    ideaPhaseStart: new Date("2026-08-22T10:00:00.000Z"),
    ideaPhaseEnd: new Date("2026-08-22T10:00:00.000Z"),
    implPhaseStart: new Date("2026-08-22T10:00:00.000Z"),
    implPhaseEnd: new Date("2026-08-22T14:00:00.000Z"),
  });
  assertOk(validateArenaTimeline(noPlanning));
});

test("phases out of order are refused", () => {
  // The hole this closes: arenaSchema only refines the registration pair, so
  // without this an arena whose build ends before registration opens is
  // creatable - and deriveArenaStatus reads it as UNDER_JUDGING from the moment
  // it is published, so nobody can ever enter it.
  const cases: Partial<ArenaTimeline>[] = [
    { registrationEnd: new Date("2026-08-20T09:00:00.000Z") },
    { ideaPhaseStart: new Date("2026-08-22T09:30:00.000Z") },
    { ideaPhaseEnd: new Date("2026-08-22T09:45:00.000Z") },
    { implPhaseStart: new Date("2026-08-22T09:00:00.000Z") },
  ];

  for (const over of cases) {
    assertRejected(validateArenaTimeline(timeline(240, over)), /must not be before/);
  }
});

test("an invalid date is named rather than compared", () => {
  const bad = timeline(240, { implPhaseEnd: new Date("not a date") });
  assertRejected(validateArenaTimeline(bad), /implPhaseEnd is not a valid date/);
});

test("a gap between registration closing and planning starting is allowed", () => {
  const gapped = timeline(240, {
    ideaPhaseStart: new Date("2026-08-22T12:00:00.000Z"),
    ideaPhaseEnd: new Date("2026-08-22T12:30:00.000Z"),
    implPhaseStart: new Date("2026-08-22T12:30:00.000Z"),
    implPhaseEnd: new Date("2026-08-22T16:30:00.000Z"),
  });
  assertOk(validateArenaTimeline(gapped));
});
