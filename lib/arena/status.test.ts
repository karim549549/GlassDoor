import { test } from "node:test";
import assert from "node:assert/strict";
import { arenaStatusWhere, deriveArenaStatus, type ArenaPhaseWindows } from "./status";

const d = (iso: string) => new Date(iso);

/** Contiguous, correctly-ordered phases: registration -> idea -> implementation. */
const BASE: ArenaPhaseWindows = {
  publishedAt: d("2025-12-01T00:00:00Z"),
  canceledAt: null,
  resultsPublishedAt: null,
  registrationStart: d("2026-01-01T00:00:00Z"),
  registrationEnd: d("2026-01-10T00:00:00Z"),
  ideaPhaseStart: d("2026-01-10T00:00:00Z"),
  ideaPhaseEnd: d("2026-01-20T00:00:00Z"),
  implPhaseStart: d("2026-01-20T00:00:00Z"),
  implPhaseEnd: d("2026-02-01T00:00:00Z"),
};

const arena = (overrides: Partial<ArenaPhaseWindows> = {}): ArenaPhaseWindows => ({
  ...BASE,
  ...overrides,
});

// --- rule 1-3: lifecycle flags -------------------------------------------

test("rule 1: canceledAt set yields CANCELED", () => {
  assert.equal(
    deriveArenaStatus(arena({ canceledAt: d("2026-01-05T00:00:00Z") }), d("2026-01-05T12:00:00Z")),
    "CANCELED"
  );
});

test("rule 2: resultsPublishedAt set yields COMPLETED", () => {
  assert.equal(
    deriveArenaStatus(
      arena({ resultsPublishedAt: d("2026-02-02T00:00:00Z") }),
      d("2026-02-03T00:00:00Z")
    ),
    "COMPLETED"
  );
});

test("rule 3: unpublished arena is DRAFT", () => {
  assert.equal(deriveArenaStatus(arena({ publishedAt: null }), d("2025-12-15T00:00:00Z")), "DRAFT");
});

// --- rule 4-9: the timeline ----------------------------------------------

test("rule 4: past the implementation end is UNDER_JUDGING", () => {
  assert.equal(deriveArenaStatus(arena(), d("2026-02-05T00:00:00Z")), "UNDER_JUDGING");
});

test("rule 5: inside the implementation window is IMPLEMENTATION_PHASE", () => {
  assert.equal(deriveArenaStatus(arena(), d("2026-01-25T00:00:00Z")), "IMPLEMENTATION_PHASE");
});

test("rule 6: inside the idea window is IDEA_PHASE", () => {
  assert.equal(deriveArenaStatus(arena(), d("2026-01-15T00:00:00Z")), "IDEA_PHASE");
});

test("rule 7: inside the registration window is REGISTRATION_OPEN", () => {
  assert.equal(deriveArenaStatus(arena(), d("2026-01-05T00:00:00Z")), "REGISTRATION_OPEN");
});

test("rule 8: before registration opens is SCHEDULED", () => {
  assert.equal(deriveArenaStatus(arena(), d("2025-12-20T00:00:00Z")), "SCHEDULED");
});

test("rule 9: a gap between phases falls back to IMPLEMENTATION_PHASE", () => {
  // Registration has closed but the idea phase does not open for another week.
  const gapped = arena({ ideaPhaseStart: d("2026-01-17T00:00:00Z") });
  assert.equal(deriveArenaStatus(gapped, d("2026-01-12T00:00:00Z")), "IMPLEMENTATION_PHASE");
});

// --- precedence conflicts -------------------------------------------------

test("canceled beats results-published", () => {
  const both = arena({
    canceledAt: d("2026-01-05T00:00:00Z"),
    resultsPublishedAt: d("2026-02-02T00:00:00Z"),
  });
  assert.equal(deriveArenaStatus(both, d("2026-02-03T00:00:00Z")), "CANCELED");
});

test("results-published beats a still-live implementation window", () => {
  const early = arena({ resultsPublishedAt: d("2026-01-25T00:00:00Z") });
  assert.equal(deriveArenaStatus(early, d("2026-01-26T00:00:00Z")), "COMPLETED");
});

test("draft beats every time-based rule", () => {
  const unpublished = arena({ publishedAt: null });
  assert.equal(deriveArenaStatus(unpublished, d("2026-01-25T00:00:00Z")), "DRAFT");
  assert.equal(deriveArenaStatus(unpublished, d("2026-02-05T00:00:00Z")), "DRAFT");
  assert.equal(deriveArenaStatus(unpublished, d("2026-01-05T00:00:00Z")), "DRAFT");
});

test("canceled beats draft", () => {
  const both = arena({ publishedAt: null, canceledAt: d("2025-12-05T00:00:00Z") });
  assert.equal(deriveArenaStatus(both, d("2025-12-20T00:00:00Z")), "CANCELED");
});

// --- exact boundary instants ---------------------------------------------

test("boundary: now === registrationStart is REGISTRATION_OPEN", () => {
  assert.equal(deriveArenaStatus(arena(), BASE.registrationStart), "REGISTRATION_OPEN");
});

test("boundary: one millisecond before registrationStart is SCHEDULED", () => {
  const justBefore = new Date(BASE.registrationStart.getTime() - 1);
  assert.equal(deriveArenaStatus(arena(), justBefore), "SCHEDULED");
});

test("boundary: now === registrationEnd is no longer REGISTRATION_OPEN", () => {
  // registrationEnd === ideaPhaseStart here, so the idea phase takes over.
  assert.equal(deriveArenaStatus(arena(), BASE.registrationEnd), "IDEA_PHASE");
});

test("boundary: now === ideaPhaseEnd is no longer IDEA_PHASE", () => {
  // ideaPhaseEnd === implPhaseStart here, so implementation takes over.
  assert.equal(deriveArenaStatus(arena(), BASE.ideaPhaseEnd), "IMPLEMENTATION_PHASE");
});

test("boundary: now === implPhaseStart is IMPLEMENTATION_PHASE", () => {
  assert.equal(deriveArenaStatus(arena(), BASE.implPhaseStart), "IMPLEMENTATION_PHASE");
});

test("boundary: now === implPhaseEnd is UNDER_JUDGING, not IMPLEMENTATION_PHASE", () => {
  assert.equal(deriveArenaStatus(arena(), BASE.implPhaseEnd), "UNDER_JUDGING");
});

test("boundary: one millisecond before implPhaseEnd is still IMPLEMENTATION_PHASE", () => {
  const justBefore = new Date(BASE.implPhaseEnd.getTime() - 1);
  assert.equal(deriveArenaStatus(arena(), justBefore), "IMPLEMENTATION_PHASE");
});

// --- REP 90-minute format: zero-width idea window -------------------------

const REP: ArenaPhaseWindows = {
  publishedAt: d("2026-03-01T00:00:00Z"),
  canceledAt: null,
  resultsPublishedAt: null,
  registrationStart: d("2026-03-10T09:00:00Z"),
  registrationEnd: d("2026-03-10T10:00:00Z"),
  ideaPhaseStart: d("2026-03-10T10:00:00Z"),
  ideaPhaseEnd: d("2026-03-10T10:00:00Z"),
  implPhaseStart: d("2026-03-10T10:00:00Z"),
  implPhaseEnd: d("2026-03-10T11:30:00Z"),
};

test("REP: the zero-width idea window is never reported", () => {
  assert.equal(deriveArenaStatus(REP, d("2026-03-10T09:30:00Z")), "REGISTRATION_OPEN");
  // The single instant the window "contains" still falls through to impl.
  assert.equal(deriveArenaStatus(REP, REP.ideaPhaseStart), "IMPLEMENTATION_PHASE");
  assert.equal(deriveArenaStatus(REP, d("2026-03-10T10:45:00Z")), "IMPLEMENTATION_PHASE");
  assert.equal(deriveArenaStatus(REP, REP.implPhaseEnd), "UNDER_JUDGING");
});

// --- arenaStatusWhere -----------------------------------------------------

const NOW = d("2026-01-15T00:00:00Z");

test('arenaStatusWhere("all") is an empty filter', () => {
  assert.deepEqual(arenaStatusWhere("all", NOW), {});
});

test('arenaStatusWhere("open") requires a live arena inside registration', () => {
  assert.deepEqual(arenaStatusWhere("open", NOW), {
    publishedAt: { not: null },
    canceledAt: null,
    registrationStart: { lte: NOW },
    registrationEnd: { gt: NOW },
  });
});

test('arenaStatusWhere("live") requires registration closed and impl running', () => {
  assert.deepEqual(arenaStatusWhere("live", NOW), {
    publishedAt: { not: null },
    canceledAt: null,
    registrationEnd: { lte: NOW },
    implPhaseEnd: { gt: NOW },
  });
});

test('arenaStatusWhere("finished") matches anything past its build window', () => {
  // Deliberately not `resultsPublishedAt: { not: null }`, which is what this
  // asserted before. Nothing can create a judge assignment, so no arena has
  // ever had results published - under the old rule "finished" matched nothing
  // while every ended arena appeared only under "all". Judging is optional
  // (PRD 7.1a); an arena that has run is finished whether or not it was scored.
  assert.deepEqual(arenaStatusWhere("finished", NOW), {
    publishedAt: { not: null },
    canceledAt: null,
    implPhaseEnd: { lte: NOW },
  });
});
