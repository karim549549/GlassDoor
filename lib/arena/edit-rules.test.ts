import { test } from "node:test";
import assert from "node:assert/strict";
import { checkScheduleEdit, PHASE_FIELDS, type PhaseField } from "./edit-rules";

const NOW = new Date("2026-08-19T12:00:00Z");
const d = (iso: string) => new Date(iso);

/** An arena mid-build: registration and planning are behind it, the build is not. */
const running: Record<PhaseField, Date> = {
  registrationStart: d("2026-08-01T00:00:00Z"),
  registrationEnd: d("2026-08-15T00:00:00Z"),
  ideaPhaseStart: d("2026-08-19T09:00:00Z"),
  ideaPhaseEnd: d("2026-08-19T09:30:00Z"),
  implPhaseStart: d("2026-08-19T09:30:00Z"),
  implPhaseEnd: d("2026-08-19T18:00:00Z"),
};

const asPayload = (over: Partial<Record<PhaseField, string>> = {}) => {
  const out = {} as Record<PhaseField, string>;
  for (const f of PHASE_FIELDS) out[f] = running[f].toISOString();
  return { ...out, ...over };
};

test("changing nothing is allowed", () => {
  assert.deepEqual(checkScheduleEdit(running, asPayload(), NOW), { ok: true });
});

test("a boundary still in the future moves freely, in either direction", () => {
  const later = checkScheduleEdit(
    running,
    asPayload({ implPhaseEnd: "2026-08-19T23:00:00Z" }),
    NOW
  );
  assert.deepEqual(later, { ok: true });

  // Earlier is fine too, as long as it has not happened yet - cutting a build
  // short is the host's call.
  const earlier = checkScheduleEdit(
    running,
    asPayload({ implPhaseEnd: "2026-08-19T16:00:00Z" }),
    NOW
  );
  assert.deepEqual(earlier, { ok: true });
});

test("a boundary that has passed may be pushed forward", () => {
  // Reopening registration after it closed. Adds people; removes nobody.
  const result = checkScheduleEdit(
    running,
    asPayload({ registrationEnd: "2026-08-19T17:00:00Z" }),
    NOW
  );
  assert.deepEqual(result, { ok: true });
});

test("a boundary that has passed may not be pulled backwards", () => {
  // The one that matters: everyone who entered between the 10th and the 15th
  // would retroactively have joined an arena that was already closed.
  const result = checkScheduleEdit(
    running,
    asPayload({ registrationEnd: "2026-08-10T00:00:00Z" }),
    NOW
  );

  assert.equal(result.ok, false);
  assert.match(result.ok === false ? result.error : "", /Registration closes/);
  assert.match(result.ok === false ? result.error : "", /cannot be moved earlier/);
});

test("the first offending boundary is the one reported", () => {
  const result = checkScheduleEdit(
    running,
    asPayload({
      registrationStart: "2026-07-01T00:00:00Z",
      registrationEnd: "2026-08-02T00:00:00Z",
    }),
    NOW
  );

  assert.equal(result.ok, false);
  // registrationStart comes first in PHASE_FIELDS, so it is the one named -
  // one clear error beats a list the host has to read backwards.
  assert.match(result.ok === false ? result.error : "", /Registration opens/);
});

test("an arena that has not started yet is entirely reschedulable", () => {
  const scheduled: Record<PhaseField, Date> = {
    registrationStart: d("2026-09-01T00:00:00Z"),
    registrationEnd: d("2026-09-10T00:00:00Z"),
    ideaPhaseStart: d("2026-09-12T09:00:00Z"),
    ideaPhaseEnd: d("2026-09-12T09:30:00Z"),
    implPhaseStart: d("2026-09-12T09:30:00Z"),
    implPhaseEnd: d("2026-09-12T18:00:00Z"),
  };

  const moved = {} as Record<PhaseField, string>;
  for (const f of PHASE_FIELDS) {
    moved[f] = new Date(scheduled[f].getTime() - 7 * 24 * 3_600_000).toISOString();
  }

  assert.deepEqual(checkScheduleEdit(scheduled, moved, NOW), { ok: true });
});
