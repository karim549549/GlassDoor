import { test } from "node:test";
import assert from "node:assert/strict";
import { arenaSchema } from "./schema";

/**
 * These cover the cross-field timeline rule specifically. Before it existed,
 * `arenaSchema` validated only that registrationEnd came after
 * registrationStart - so an arena whose implementation window opened BEFORE
 * registration closed was creatable, and since status is derived from these
 * timestamps it reported UNDER_JUDGING from the moment it was published.
 */

const iso = (d: string) => new Date(d).toISOString();

/** A well-ordered ARENA timeline: reg -> idea -> implementation, ~2 weeks. */
function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Cairo Systems Arena",
    description: "Build a partition-tolerant service under load.",
    format: "ARENA",
    rulesText: "Original work only.",
    registrationStart: iso("2026-09-01T00:00:00Z"),
    registrationEnd: iso("2026-09-05T00:00:00Z"),
    ideaPhaseStart: iso("2026-09-05T00:00:00Z"),
    ideaPhaseEnd: iso("2026-09-08T00:00:00Z"),
    implPhaseStart: iso("2026-09-08T00:00:00Z"),
    implPhaseEnd: iso("2026-09-15T00:00:00Z"),
    ...overrides,
  };
}

test("accepts a correctly ordered ARENA timeline", () => {
  const result = arenaSchema.safeParse(validPayload());
  assert.equal(result.success, true, JSON.stringify(result.error?.issues));
});

test("rejects an implementation phase that starts before registration closes", () => {
  // The exact shape that used to slip through.
  const result = arenaSchema.safeParse(
    validPayload({
      implPhaseStart: iso("2026-09-02T00:00:00Z"),
      implPhaseEnd: iso("2026-09-04T00:00:00Z"),
      ideaPhaseStart: iso("2026-09-02T00:00:00Z"),
      ideaPhaseEnd: iso("2026-09-03T00:00:00Z"),
    })
  );
  assert.equal(result.success, false);
});

test("rejects phases that run backwards", () => {
  const result = arenaSchema.safeParse(
    validPayload({ implPhaseEnd: iso("2026-09-07T00:00:00Z") })
  );
  assert.equal(result.success, false);
});

test("still rejects registration end before registration start", () => {
  const result = arenaSchema.safeParse(
    validPayload({ registrationEnd: iso("2026-08-30T00:00:00Z") })
  );
  assert.equal(result.success, false);
});

test("accepts a REP zero-width idea window", () => {
  // A 90-minute REP has no ideation stage, so idea start == idea end ==
  // registration end. Adjacent phases are compared with "not before", not
  // "strictly after" - requiring strict increase would make REP uncreatable.
  const at = iso("2026-09-05T10:00:00Z");
  const result = arenaSchema.safeParse(
    validPayload({
      format: "REP",
      registrationStart: iso("2026-09-05T09:00:00Z"),
      registrationEnd: at,
      ideaPhaseStart: at,
      ideaPhaseEnd: at,
      implPhaseStart: at,
      implPhaseEnd: iso("2026-09-05T11:30:00Z"),
    })
  );
  assert.equal(result.success, true, JSON.stringify(result.error?.issues));
});

test("rejects a REP whose implementation window exceeds the format's bounds", () => {
  // REP is a 90-minute format; a 3-week one is an ARENA wearing the wrong label.
  const at = iso("2026-09-05T10:00:00Z");
  const result = arenaSchema.safeParse(
    validPayload({
      format: "REP",
      registrationStart: iso("2026-09-05T09:00:00Z"),
      registrationEnd: at,
      ideaPhaseStart: at,
      ideaPhaseEnd: at,
      implPhaseStart: at,
      implPhaseEnd: iso("2026-09-26T10:00:00Z"),
    })
  );
  assert.equal(result.success, false);
});
