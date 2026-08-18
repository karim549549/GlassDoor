/**
 * Arena URLs.
 *
 * The old format was `/arena/{slugified-title}-{uuid}` — 36 characters of hex
 * bolted onto the end of every link, so the address bar read
 * `.../the-worst-possible-date-picker-19eaf5f9-3fc2-4a40-a645-d54b34a799de`.
 * The uuid was doing the actual work and the words were decoration, which is
 * the wrong way round: a URL is read by people, in a history dropdown, in a
 * shared message, in a search result, and none of those are improved by a
 * primary key.
 *
 * Arenas now carry a stored `slug` column, unique, and the URL is just that.
 * The uuid form still resolves — every link ever shared keeps working — but it
 * redirects to the canonical slug rather than rendering under it, so history
 * converges on one readable address per arena.
 */

/** Words that make a URL longer without making it clearer. */
const STOPWORDS = new Set([
  "a", "an", "and", "at", "but", "by", "for", "in", "of", "on", "or",
  "that", "the", "to", "with",
]);

/**
 * Longest slug we will build from a title.
 *
 * Titles run to 90 characters (`TITLE_MAX`), and a 90-character path segment
 * is the same readability problem as the uuid was. Truncation lands on a word
 * boundary, never mid-word.
 */
const MAX_SLUG_LENGTH = 60;

/** Convert a string into a URL-safe slug: lowercase, hyphenated, ASCII-ish. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Decompose accents so "café" becomes "cafe" rather than "caf".
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "") // strip non-word chars except spaces & hyphens
    .replace(/[\s_]+/g, "-") // collapse whitespace / underscores to hyphens
    .replace(/-+/g, "-") // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * The slug for a title, before uniqueness is considered.
 *
 * Stopwords are dropped only when the title is long enough to need it — "a
 * site with absolutely zero business value" reads better as
 * `site-absolutely-zero-business-value` than truncated mid-phrase, but a short
 * title like "The zero-JavaScript challenge" keeps its article, because
 * `zero-javascript-challenge` and `the-zero-javascript-challenge` are the same
 * length problem and the second is what the host actually wrote.
 */
export function arenaSlugBase(title: string): string {
  const full = slugifyTitle(title);
  if (full.length <= MAX_SLUG_LENGTH) return full;

  const kept = full.split("-").filter((word) => !STOPWORDS.has(word));
  const trimmed = kept.join("-");
  const source = trimmed.length > 0 ? trimmed : full;

  if (source.length <= MAX_SLUG_LENGTH) return source;

  // Cut on a hyphen, so the slug never ends mid-word.
  const words: string[] = [];
  let length = 0;
  for (const word of source.split("-")) {
    const next = length === 0 ? word.length : length + 1 + word.length;
    if (next > MAX_SLUG_LENGTH) break;
    words.push(word);
    length = next;
  }

  return words.join("-");
}

/**
 * Make a base slug unique against the ones already taken.
 *
 * Counter suffixes, not a uuid fragment. `date-picker-2` says what it is — the
 * second arena someone named that — where `date-picker-a1b2c3d4` says nothing
 * and reintroduces exactly the noise this change removes. Collisions are rare
 * enough that the counter stays a single digit in practice.
 *
 * Pure, and takes the taken set as an argument, so the rule is testable
 * without a database.
 */
export function uniqueArenaSlug(base: string, taken: Iterable<string>): string {
  // An empty base means a title of pure punctuation. "arena" beats an empty
  // path segment, and the counter below makes it unique.
  const root = base || "arena";
  const used = new Set(taken);

  if (!used.has(root)) return root;

  let n = 2;
  while (used.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

/**
 * Canonical UUID shape: 8-4-4-4-12 hex, with the version/variant nibbles left
 * unconstrained so a v4 id and a v7 id both parse.
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Extract the UUID from a legacy `title-uuid` path, or null when there isn't
 * one.
 *
 * Still needed in two places. Every arena link shared before this change ends
 * in a uuid, and the API routes are called by client code that holds the id
 * rather than the slug — so both forms have to resolve. Returns null rather
 * than a best guess: the value goes straight into a Prisma `where: { id }`,
 * and an earlier version returned `slug.slice(-36)` unvalidated, which handed
 * arbitrary caller-controlled strings to the query layer.
 */
export function extractUuidFromSlug(slug: string): string | null {
  if (slug.length < 36) {
    return null;
  }
  const candidate = slug.slice(-36);
  return UUID_PATTERN.test(candidate) ? candidate.toLowerCase() : null;
}

/**
 * How a path segment should be looked up.
 *
 * One place decides, so a page and an API route cannot disagree about whether
 * `2026-08-19-...` is a slug or a mangled uuid.
 */
export type ArenaRef =
  | { kind: "id"; id: string }
  | { kind: "slug"; slug: string };

export function parseArenaRef(param: string): ArenaRef | null {
  const decoded = decodeURIComponent(param).trim();
  if (!decoded) return null;

  // A trailing uuid wins: it is unambiguous, and it is what every legacy link
  // carries.
  const uuid = extractUuidFromSlug(decoded);
  if (uuid) return { kind: "id", id: uuid };

  // Anything else is a slug, as long as it looks like one. Rejecting here
  // keeps junk out of the query layer for the same reason as above.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(decoded.toLowerCase())) return null;
  if (decoded.length > 100) return null;

  return { kind: "slug", slug: decoded.toLowerCase() };
}
