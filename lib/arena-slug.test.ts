import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slugifyTitle,
  arenaSlugBase,
  uniqueArenaSlug,
  extractUuidFromSlug,
  parseArenaRef,
} from "./arena-slug";

const UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

test("slugifyTitle lowercases, hyphenates and strips punctuation", () => {
  assert.equal(slugifyTitle("The Most Devious Video Player"), "the-most-devious-video-player");
  assert.equal(slugifyTitle("  Spaces   and---hyphens  "), "spaces-and-hyphens");
  assert.equal(slugifyTitle("A site with absolutely zero business value!"), "a-site-with-absolutely-zero-business-value");
  // A title of pure punctuation slugifies to nothing; `arenaSlugBase` is what
  // decides the fallback, not this.
  assert.equal(slugifyTitle("!!!"), "");
});

test("slugifyTitle folds accents rather than deleting the letter", () => {
  assert.equal(slugifyTitle("Café Night"), "cafe-night");
});

test("a short title keeps every word, articles included", () => {
  // The stopword pass exists to fit long titles, not to rewrite what the host
  // typed. "Rebuild something famous, but wrong" is well inside the cap.
  assert.equal(
    arenaSlugBase("Rebuild something famous, but wrong"),
    "rebuild-something-famous-but-wrong"
  );
  assert.equal(
    arenaSlugBase("A dashboard for something that needs no dashboard"),
    "a-dashboard-for-something-that-needs-no-dashboard"
  );
});

test("a long title drops stopwords before it truncates", () => {
  const long =
    "The most devious video player in the whole of the world and also the moon";
  const slug = arenaSlugBase(long);

  assert.ok(slug.length <= 60, `${slug} is ${slug.length} characters`);
  assert.ok(!slug.split("-").includes("the"), slug);
  // Whole words only - a slug never ends mid-word.
  assert.ok(!long.toLowerCase().includes(`${slug}x`), slug);
});

test("a very long title truncates on a word boundary", () => {
  const slug = arenaSlugBase("supercalifragilistic ".repeat(8));
  assert.ok(slug.length <= 60, `${slug} is ${slug.length} characters`);
  assert.ok(!slug.endsWith("-"), slug);
  // Every retained piece is a complete word from the source.
  for (const word of slug.split("-")) {
    assert.equal(word, "supercalifragilistic");
  }
});

test("uniqueArenaSlug returns the base when it is free", () => {
  assert.equal(uniqueArenaSlug("date-picker", []), "date-picker");
  assert.equal(uniqueArenaSlug("date-picker", ["something-else"]), "date-picker");
});

test("uniqueArenaSlug counts up, and skips numbers already taken", () => {
  assert.equal(uniqueArenaSlug("date-picker", ["date-picker"]), "date-picker-2");
  assert.equal(
    uniqueArenaSlug("date-picker", ["date-picker", "date-picker-2", "date-picker-3"]),
    "date-picker-4"
  );
  // A counter, not a uuid fragment: `date-picker-2` says what it is.
  assert.ok(/^date-picker-\d+$/.test(uniqueArenaSlug("date-picker", ["date-picker"])));
});

test("uniqueArenaSlug never returns an empty path segment", () => {
  assert.equal(uniqueArenaSlug("", []), "arena");
  assert.equal(uniqueArenaSlug("", ["arena"]), "arena-2");
});

test("extractUuidFromSlug recovers the uuid from a legacy path", () => {
  assert.equal(extractUuidFromSlug(`my-arena-${UUID}`), UUID);
  assert.equal(extractUuidFromSlug(UUID), UUID);
  assert.equal(extractUuidFromSlug(`arena-${UUID.toUpperCase()}`), UUID);
});

test("extractUuidFromSlug rejects anything that is not a uuid", () => {
  assert.equal(extractUuidFromSlug("short"), null);
  assert.equal(extractUuidFromSlug(""), null);
  assert.equal(extractUuidFromSlug("x".repeat(36)), null);
  assert.equal(extractUuidFromSlug("a-slug-with-no-uuid-at-the-very-end!!"), null);
  assert.equal(extractUuidFromSlug("a1b2c3d4e5f6-7890-abcd-ef1234567890xx"), null);
  assert.equal(extractUuidFromSlug(`${UUID.slice(0, 35)}g`), null);
});

test("parseArenaRef prefers a trailing uuid, so legacy links still resolve", () => {
  assert.deepEqual(parseArenaRef(`my-arena-${UUID}`), { kind: "id", id: UUID });
  assert.deepEqual(parseArenaRef(UUID), { kind: "id", id: UUID });
});

test("parseArenaRef treats a plain slug as a slug", () => {
  assert.deepEqual(parseArenaRef("the-worst-possible-date-picker"), {
    kind: "slug",
    slug: "the-worst-possible-date-picker",
  });
  assert.deepEqual(parseArenaRef("date-picker-2"), { kind: "slug", slug: "date-picker-2" });
  assert.deepEqual(parseArenaRef("THE-WORST"), { kind: "slug", slug: "the-worst" });
});

test("parseArenaRef refuses junk rather than handing it to the query layer", () => {
  assert.equal(parseArenaRef(""), null);
  assert.equal(parseArenaRef("   "), null);
  assert.equal(parseArenaRef("has spaces"), null);
  assert.equal(parseArenaRef("../../etc/passwd"), null);
  assert.equal(parseArenaRef("trailing-"), null);
  assert.equal(parseArenaRef("a".repeat(101)), null);
});

test("a generated slug always parses back as a slug", () => {
  for (const title of ["My Arena", "!!!", "Café Night", "supercalifragilistic ".repeat(8)]) {
    const slug = uniqueArenaSlug(arenaSlugBase(title), []);
    assert.deepEqual(parseArenaRef(slug), { kind: "slug", slug }, title);
  }
});
