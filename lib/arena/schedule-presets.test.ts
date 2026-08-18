import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SCHEDULE_PRESETS,
  findPreset,
  deriveSchedule,
  scheduleSegments,
  formatDuration,
  toDateTimeLocal,
} from "./schedule-presets";

const classic = findPreset("classic")!;

test("classic is the reference format, 30 minutes then 4 hours", () => {
  assert.equal(classic.planMinutes, 30);
  assert.equal(classic.buildMinutes, 240);
});

test("custom is not a preset - it is the absence of one", () => {
  assert.equal(findPreset("custom"), null);
  assert.equal(SCHEDULE_PRESETS.some((p) => (p.id as string) === "custom"), false);
});

test("derives the six windows from a start, an opening, and a shape", () => {
  const opensAt = new Date(2026, 7, 18, 9, 0);
  const startsAt = new Date(2026, 7, 22, 10, 0);

  const s = deriveSchedule({ startsAt, opensAt, preset: classic });

  assert.equal(s.registrationStart, "2026-08-18T09:00");
  assert.equal(s.registrationEnd, "2026-08-22T10:00");
  assert.equal(s.ideaPhaseStart, "2026-08-22T10:00");
  assert.equal(s.ideaPhaseEnd, "2026-08-22T10:30");
  assert.equal(s.implPhaseStart, "2026-08-22T10:30");
  assert.equal(s.implPhaseEnd, "2026-08-22T14:30");
});

test("phases butt-join, leaving no instant in no phase", () => {
  const s = deriveSchedule({
    startsAt: new Date(2026, 7, 22, 10, 0),
    opensAt: new Date(2026, 7, 18, 9, 0),
    preset: classic,
  });
  assert.equal(s.registrationEnd, s.ideaPhaseStart);
  assert.equal(s.ideaPhaseEnd, s.implPhaseStart);
});

test("crosses midnight and month boundaries without drifting", () => {
  const marathon = findPreset("marathon")!;
  const s = deriveSchedule({
    startsAt: new Date(2026, 7, 31, 20, 0),
    opensAt: new Date(2026, 7, 30, 20, 0),
    preset: marathon,
  });
  // 20:00 + 60m plan = 21:00, + 480m build = 05:00 the next day, next month.
  assert.equal(s.ideaPhaseEnd, "2026-08-31T21:00");
  assert.equal(s.implPhaseEnd, "2026-09-01T05:00");
});

test("datetime-local formatting stays in local time", () => {
  // toISOString() here would shift by the UTC offset and show the host a start
  // they did not pick. Zero-padding matters too: "2026-1-5T9:05" is rejected
  // by the input.
  assert.equal(toDateTimeLocal(new Date(2026, 0, 5, 9, 5)), "2026-01-05T09:05");
});

test("segments are proportional and sum to 100", () => {
  const segments = scheduleSegments({
    registrationStart: new Date(2026, 7, 22, 9, 0),
    registrationEnd: new Date(2026, 7, 22, 10, 0),
    ideaPhaseEnd: new Date(2026, 7, 22, 10, 30),
    implPhaseEnd: new Date(2026, 7, 22, 14, 30),
  });

  assert.equal(segments.length, 3);
  const total = segments.reduce((sum, s) => sum + s.percent, 0);
  assert.ok(Math.abs(total - 100) < 0.001, `expected 100, got ${total}`);
  assert.equal(segments[1].minutes, 30);
  assert.equal(segments[2].minutes, 240);
});

test("a long registration cannot squeeze the contest out of the ribbon", () => {
  // Three weeks of registration around a four-and-a-half-hour contest. To
  // scale, plan and build would be 0.1% of the bar - two invisible slivers.
  const segments = scheduleSegments({
    registrationStart: new Date(2026, 7, 1, 10, 0),
    registrationEnd: new Date(2026, 7, 22, 10, 0),
    ideaPhaseEnd: new Date(2026, 7, 22, 10, 30),
    implPhaseEnd: new Date(2026, 7, 22, 14, 30),
  });

  const registration = segments[0];
  assert.ok(registration.percent <= 25.001, `capped, got ${registration.percent}`);
  // The real duration is still reported, only the width is clamped.
  assert.equal(registration.minutes, 21 * 24 * 60);
  // 8.333... + 66.666... lands a hair under 75 in binary floating point, so
  // this needs a tolerance rather than an exact floor.
  assert.ok(segments[1].percent + segments[2].percent >= 74.999);
});

test("a zero-length contest yields no segments rather than dividing by zero", () => {
  const t = new Date(2026, 7, 22, 10, 0);
  assert.deepEqual(
    scheduleSegments({ registrationStart: t, registrationEnd: t, ideaPhaseEnd: t, implPhaseEnd: t }),
    []
  );
});

test("durations read the way a person would say them", () => {
  assert.equal(formatDuration(30), "30m");
  assert.equal(formatDuration(60), "1h");
  assert.equal(formatDuration(240), "4h");
  assert.equal(formatDuration(90), "1h 30m");
});
