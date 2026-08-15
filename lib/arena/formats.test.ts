import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canEnter,
  FORMAT_RULES,
  getFormatRules,
  validateArenaTimeline,
  type ArenaTimeline,
  type FormatCheck,
} from "./formats";

const d = (iso: string) => new Date(iso);

/** Asserts a check passed, printing the rejection reason when it did not. */
function assertOk(check: FormatCheck) {
  assert.equal(check.ok, true, check.ok ? "" : check.reason);
}

/** Asserts a check failed, optionally matching the reason. */
function assertRejected(check: FormatCheck, match?: RegExp) {
  assert.equal(check.ok, false, "expected a rejection, got ok");
  if (!check.ok && match) assert.match(check.reason, match);
}

const MINUTE = 60_000;

/**
 * Builds a well-ordered timeline whose implementation window is exactly
 * `implMinutes` long, so duration tests are not entangled with ordering tests.
 */
function timeline(implMinutes: number, overrides: Partial<ArenaTimeline> = {}): ArenaTimeline {
  const implStart = d("2026-04-01T00:00:00Z");
  return {
    registrationStart: d("2026-03-01T00:00:00Z"),
    registrationEnd: d("2026-03-20T00:00:00Z"),
    ideaPhaseStart: d("2026-03-20T00:00:00Z"),
    ideaPhaseEnd: d("2026-03-25T00:00:00Z"),
    implPhaseStart: implStart,
    implPhaseEnd: new Date(implStart.getTime() + implMinutes * MINUTE),
    ...overrides,
  };
}

// --- format rules --------------------------------------------------------

test("REP is auto-judged, open, and issues no proof packet", () => {
  const rep = getFormatRules("REP");
  assert.equal(rep.judging, "AUTO");
  assert.equal(rep.ratingGated, false);
  assert.equal(rep.issuesProofPacket, false);
  // Auto-judged formats need no human judges; the schema default of 2 would
  // leave every REP submission permanently short of its judge quota.
  assert.equal(rep.defaultMinJudgesPerSubmission, 0);
});

test("LIVE is human-judged, rating-gated, and issues a proof packet", () => {
  const live = getFormatRules("LIVE");
  assert.equal(live.judging, "HUMAN");
  assert.equal(live.ratingGated, true);
  assert.equal(live.issuesProofPacket, true);
  assert.equal(typeof live.defaultMinRatingToEnter, "number");
});

test("ARENA is human-judged, ungated, and issues a proof packet", () => {
  const arena = getFormatRules("ARENA");
  assert.equal(arena.judging, "HUMAN");
  assert.equal(arena.ratingGated, false);
  assert.equal(arena.issuesProofPacket, true);
  assert.equal(arena.defaultMinRatingToEnter, null);
});

test("every rating-gated format has a default floor, and no ungated one does", () => {
  for (const rules of Object.values(FORMAT_RULES)) {
    assert.equal(
      rules.ratingGated,
      rules.defaultMinRatingToEnter !== null,
      `${rules.label}: a gated format without a floor is silently ungated`
    );
  }
});

test("every format's duration bounds are ordered and positive", () => {
  for (const rules of Object.values(FORMAT_RULES)) {
    assert.ok(rules.durationMinutes.min > 0, `${rules.label} min`);
    assert.ok(
      rules.durationMinutes.max >= rules.durationMinutes.min,
      `${rules.label} max < min`
    );
  }
});

// --- ordering ------------------------------------------------------------

test("a contiguous, correctly-ordered timeline is accepted", () => {
  assertOk(validateArenaTimeline("ARENA", timeline(14 * 24 * 60)));
});

test("REP's zero-width idea window is accepted (equal adjacent timestamps)", () => {
  // A 90-minute REP has no ideation stage:
  // ideaPhaseStart === ideaPhaseEnd === registrationEnd. Requiring a strict
  // increase here would make REP unconstructible.
  const rep: ArenaTimeline = {
    registrationStart: d("2026-03-10T09:00:00Z"),
    registrationEnd: d("2026-03-10T10:00:00Z"),
    ideaPhaseStart: d("2026-03-10T10:00:00Z"),
    ideaPhaseEnd: d("2026-03-10T10:00:00Z"),
    implPhaseStart: d("2026-03-10T10:00:00Z"),
    implPhaseEnd: d("2026-03-10T11:30:00Z"),
  };
  assertOk(validateArenaTimeline("REP", rep));
});

test("a fully collapsed timeline fails on duration, not on ordering", () => {
  const instant = d("2026-03-10T10:00:00Z");
  const collapsed: ArenaTimeline = {
    registrationStart: instant,
    registrationEnd: instant,
    ideaPhaseStart: instant,
    ideaPhaseEnd: instant,
    implPhaseStart: instant,
    implPhaseEnd: instant,
  };
  assertRejected(validateArenaTimeline("REP", collapsed), /at least 60 minutes/);
});

test("an implementation phase before registration is rejected", () => {
  // The bug this validator exists to close: arenaSchema only refines the
  // registration pair, so this arena is creatable today, and
  // deriveArenaStatus reports it UNDER_JUDGING the instant it is published.
  const backwards = timeline(90, {
    registrationStart: d("2026-04-10T00:00:00Z"),
    registrationEnd: d("2026-04-11T00:00:00Z"),
    ideaPhaseStart: d("2026-04-11T00:00:00Z"),
    ideaPhaseEnd: d("2026-04-11T00:00:00Z"),
    implPhaseStart: d("2026-04-01T00:00:00Z"),
    implPhaseEnd: d("2026-04-01T01:30:00Z"),
  });
  // The first inversion encountered is the one reported: implementation
  // starts before the idea phase it was supposed to follow.
  assertRejected(
    validateArenaTimeline("REP", backwards),
    /implPhaseStart \(.+\) must not be before ideaPhaseEnd/
  );
});

test("registrationEnd before registrationStart is rejected", () => {
  const backwards = timeline(90, {
    registrationStart: d("2026-03-20T00:00:00Z"),
    registrationEnd: d("2026-03-01T00:00:00Z"),
  });
  assertRejected(
    validateArenaTimeline("REP", backwards),
    /registrationEnd \(.+\) must not be before registrationStart/
  );
});

test("ideaPhaseEnd before ideaPhaseStart is rejected", () => {
  const backwards = timeline(90, {
    ideaPhaseStart: d("2026-03-25T00:00:00Z"),
    ideaPhaseEnd: d("2026-03-21T00:00:00Z"),
  });
  assertRejected(
    validateArenaTimeline("REP", backwards),
    /ideaPhaseEnd \(.+\) must not be before ideaPhaseStart/
  );
});

test("implPhaseEnd before implPhaseStart is rejected", () => {
  const backwards = timeline(90, {
    implPhaseStart: d("2026-04-02T00:00:00Z"),
    implPhaseEnd: d("2026-04-01T00:00:00Z"),
  });
  assertRejected(
    validateArenaTimeline("REP", backwards),
    /implPhaseEnd \(.+\) must not be before implPhaseStart/
  );
});

test("an invalid date is rejected rather than silently comparing as NaN", () => {
  const bad = timeline(90, { implPhaseEnd: new Date("not a date") });
  assertRejected(validateArenaTimeline("REP", bad), /implPhaseEnd is not a valid date/);
});

test("a gap between phases is allowed - only inversion is an error", () => {
  const gapped = timeline(90, { ideaPhaseStart: d("2026-03-22T00:00:00Z") });
  assertOk(validateArenaTimeline("REP", gapped));
});

// --- duration bounds per format ------------------------------------------

test("REP accepts 90 minutes and rejects outside 60-180", () => {
  assertOk(validateArenaTimeline("REP", timeline(90)));
  assertOk(validateArenaTimeline("REP", timeline(60)));
  assertOk(validateArenaTimeline("REP", timeline(180)));
  assertRejected(validateArenaTimeline("REP", timeline(59)), /at least 60 minutes/);
  assertRejected(validateArenaTimeline("REP", timeline(181)), /at most 180 minutes/);
});

test("LIVE accepts 5 hours and rejects outside 4-8 hours", () => {
  assertOk(validateArenaTimeline("LIVE", timeline(5 * 60)));
  assertOk(validateArenaTimeline("LIVE", timeline(4 * 60)));
  assertOk(validateArenaTimeline("LIVE", timeline(8 * 60)));
  assertRejected(validateArenaTimeline("LIVE", timeline(90)), /at least 240 minutes/);
  assertRejected(validateArenaTimeline("LIVE", timeline(9 * 60)), /at most 480 minutes/);
});

test("ARENA accepts 7-21 days and rejects outside it", () => {
  assertOk(validateArenaTimeline("ARENA", timeline(7 * 24 * 60)));
  assertOk(validateArenaTimeline("ARENA", timeline(14 * 24 * 60)));
  assertOk(validateArenaTimeline("ARENA", timeline(21 * 24 * 60)));
  assertRejected(validateArenaTimeline("ARENA", timeline(3 * 24 * 60)), /at least 10080 minutes/);
  assertRejected(validateArenaTimeline("ARENA", timeline(30 * 24 * 60)), /at most 30240 minutes/);
});

test("the same timeline can be valid for one format and invalid for another", () => {
  const ninetyMinutes = timeline(90);
  assertOk(validateArenaTimeline("REP", ninetyMinutes));
  assertRejected(validateArenaTimeline("LIVE", ninetyMinutes));
  assertRejected(validateArenaTimeline("ARENA", ninetyMinutes));
});

// --- canEnter -------------------------------------------------------------

const LIVE_FLOOR = FORMAT_RULES.LIVE.defaultMinRatingToEnter;

test("LIVE admits a rating at or above its default floor", () => {
  assertOk(canEnter({ format: "LIVE", userRating: LIVE_FLOOR }));
  assertOk(canEnter({ format: "LIVE", userRating: LIVE_FLOOR + 300 }));
});

test("LIVE refuses a rating below its default floor", () => {
  assertRejected(
    canEnter({ format: "LIVE", userRating: LIVE_FLOOR - 1 }),
    new RegExp(`at least ${LIVE_FLOOR}`)
  );
  assertRejected(canEnter({ format: "LIVE", userRating: 1200 }), /yours is 1200/);
});

test("LIVE refuses an unrated entrant instead of waving them through", () => {
  assertRejected(canEnter({ format: "LIVE", userRating: null }), /Compete in a Rep arena first/);
  assertRejected(canEnter({ format: "LIVE" }), /Compete in a Rep arena first/);
});

test("an explicit minRatingToEnter overrides the format default, both ways", () => {
  assertOk(canEnter({ format: "LIVE", minRatingToEnter: 1000, userRating: 1100 }));
  assertRejected(
    canEnter({ format: "LIVE", minRatingToEnter: 2000, userRating: LIVE_FLOOR + 100 }),
    /at least 2000/
  );
});

test("REP admits anyone, rated or not - it is the open entry point", () => {
  assertOk(canEnter({ format: "REP", userRating: null }));
  assertOk(canEnter({ format: "REP", userRating: 100 }));
  assertOk(canEnter({ format: "REP" }));
});

test("an ungated format still honours an explicitly configured floor", () => {
  assertOk(canEnter({ format: "ARENA", userRating: null }));
  assertRejected(
    canEnter({ format: "ARENA", minRatingToEnter: 1400, userRating: 1399 }),
    /at least 1400/
  );
  assertOk(canEnter({ format: "ARENA", minRatingToEnter: 1400, userRating: 1400 }));
});

test("a fractional rating is reported rounded, not with float noise", () => {
  const check = canEnter({ format: "LIVE", userRating: 1499.6 });
  assertRejected(check, /yours is 1500/);
});
