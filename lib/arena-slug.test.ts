import { test } from "node:test";
import assert from "node:assert/strict";
import { slugifyTitle, buildArenaSlug, extractUuidFromSlug } from "./arena-slug";

const UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

test("slugifyTitle strips punctuation and collapses separators", () => {
  assert.equal(slugifyTitle("Cairo React Winter Hackathon 2026"), "cairo-react-winter-hackathon-2026");
  assert.equal(slugifyTitle("  Spaces   &&& punctuation!!  "), "spaces-punctuation");
  assert.equal(slugifyTitle("snake_case_title"), "snake-case-title");
});

test("slugifyTitle can legitimately produce an empty string", () => {
  // A title of only non-word characters slugifies to nothing; buildArenaSlug
  // has to cope with that rather than emitting a leading hyphen.
  assert.equal(slugifyTitle("!!!"), "");
});

test("buildArenaSlug appends the uuid, and falls back to the bare id", () => {
  assert.equal(buildArenaSlug("My Arena", UUID), `my-arena-${UUID}`);
  assert.equal(buildArenaSlug("!!!", UUID), UUID);
});

test("extractUuidFromSlug recovers the uuid from a full slug", () => {
  assert.equal(extractUuidFromSlug(`my-arena-${UUID}`), UUID);
  assert.equal(extractUuidFromSlug(UUID), UUID);
});

test("extractUuidFromSlug round-trips whatever buildArenaSlug produced", () => {
  for (const title of ["My Arena", "!!!", "Egyptian React Winter Hackathon 2026"]) {
    assert.equal(extractUuidFromSlug(buildArenaSlug(title, UUID)), UUID);
  }
});

test("extractUuidFromSlug lowercases so lookups are stable", () => {
  assert.equal(extractUuidFromSlug(`arena-${UUID.toUpperCase()}`), UUID);
});

test("extractUuidFromSlug rejects anything that is not a uuid", () => {
  // The previous implementation returned slug.slice(-36) unvalidated (and the
  // whole slug when shorter), handing arbitrary caller-controlled strings
  // straight to a Prisma `where: { id }`.
  assert.equal(extractUuidFromSlug("short"), null);
  assert.equal(extractUuidFromSlug(""), null);
  assert.equal(extractUuidFromSlug("x".repeat(36)), null);
  assert.equal(extractUuidFromSlug("a-slug-with-no-uuid-at-the-very-end!!"), null);
});

test("extractUuidFromSlug rejects a uuid with the wrong group layout", () => {
  assert.equal(extractUuidFromSlug("a1b2c3d4e5f6-7890-abcd-ef1234567890xx"), null);
  assert.equal(extractUuidFromSlug(`${UUID.slice(0, 35)}g`), null);
});
