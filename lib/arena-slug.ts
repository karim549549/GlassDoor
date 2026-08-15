/**
 * Arena slug utilities for SEO-friendly URLs.
 *
 * URL format: /arena/{slugified-title}-{uuid}
 * Example:    /arena/egyptian-react-winter-hackathon-2026-a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *
 * The title is slugified and concatenated with the UUID using a hyphen.
 * Since UUIDs are always 36 characters (8-4-4-4-12), we extract the
 * last 36 characters to recover the UUID, no matter what the title contains.
 */

/** Convert an arena title into a URL-safe slug */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // strip non-word chars except spaces & hyphens
    .replace(/[\s_]+/g, "-")     // collapse whitespace / underscores to hyphens
    .replace(/-+/g, "-")         // collapse consecutive hyphens
    .replace(/^-+|-+$/g, "");    // trim leading/trailing hyphens
}

/** Build a full arena slug from title + UUID */
export function buildArenaSlug(title: string, id: string): string {
  const slug = slugifyTitle(title);
  return slug ? `${slug}-${id}` : id;
}

/**
 * Canonical UUID shape: 8-4-4-4-12 hex, with the version/variant nibbles left
 * unconstrained so a v4 id and a v7 id both parse.
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Extract the UUID from an arena slug, or null when the slug doesn't end in one.
 *
 * Returns null rather than a best guess: this value goes straight into a Prisma
 * `where: { id }`, and the previous implementation returned `slug.slice(-36)`
 * with no validation at all (and the whole slug when shorter). That handed
 * arbitrary caller-controlled strings to the query layer and made a malformed
 * URL indistinguishable from a genuine miss. Callers should treat null as a
 * 404 without touching the database.
 */
export function extractUuidFromSlug(slug: string): string | null {
  if (slug.length < 36) {
    return null;
  }
  const candidate = slug.slice(-36);
  return UUID_PATTERN.test(candidate) ? candidate.toLowerCase() : null;
}
