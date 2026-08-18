import { test } from "node:test";
import assert from "node:assert/strict";
import { handleSchema, isReservedHandle, suggestHandle } from "./handle";

test("accepts a normal handle and lowercases it", () => {
  assert.equal(handleSchema.parse("karim"), "karim");
  assert.equal(handleSchema.parse("Karim"), "karim");
  assert.equal(handleSchema.parse("  Karim_99  "), "karim_99");
});

test("requires a leading letter, so a handle can never look like an id", () => {
  assert.equal(handleSchema.safeParse("1karim").success, false);
  assert.equal(handleSchema.safeParse("_karim").success, false);
  assert.equal(handleSchema.safeParse("k99").success, true);
});

test("rejects lengths outside 3-20 and disallowed characters", () => {
  assert.equal(handleSchema.safeParse("ka").success, false);
  assert.equal(handleSchema.safeParse("k".repeat(21)).success, false);
  assert.equal(handleSchema.safeParse("k".repeat(20)).success, true);
  assert.equal(handleSchema.safeParse("karim khaled").success, false);
  assert.equal(handleSchema.safeParse("karim-khaled").success, false);
  assert.equal(handleSchema.safeParse("karim@dev").success, false);
});

test("rejects reserved names, case-insensitively", () => {
  assert.equal(isReservedHandle("admin"), true);
  assert.equal(isReservedHandle("ADMIN"), true);
  assert.equal(isReservedHandle("karim"), false);
  for (const name of ["admin", "support", "staff", "devsarena", "arena", "login"]) {
    assert.equal(handleSchema.safeParse(name).success, false, name + " should be reserved");
  }
});

test("suggests a handle from a name", () => {
  assert.equal(suggestHandle("Karim Khaled"), "karim_khaled");
  assert.equal(suggestHandle("Kar!m  Khaled"), "kar_m_khaled");
  assert.equal(suggestHandle("  Ada  "), "ada");
});

test("suggests nothing rather than something unusable", () => {
  assert.equal(suggestHandle(null), null);
  assert.equal(suggestHandle(""), null);
  // Too short once cleaned.
  assert.equal(suggestHandle("Al"), null);
  // Nothing survives the leading-letter rule.
  assert.equal(suggestHandle("123 456"), null);
  // A suggestion must not hand someone a reserved name.
  assert.equal(suggestHandle("Admin"), null);
});

test("a suggestion always passes the schema when it returns one", () => {
  for (const name of ["Karim Khaled", "Ada Lovelace", "Grace  Hopper", "Zoë Müller"]) {
    const suggested = suggestHandle(name);
    if (suggested !== null) {
      assert.equal(handleSchema.safeParse(suggested).success, true, name + " -> " + suggested);
    }
  }
});
