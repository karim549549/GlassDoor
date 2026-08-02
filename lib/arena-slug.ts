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

/** Extract the UUID from an arena slug (last 36 chars) */
export function extractUuidFromSlug(slug: string): string {
  // UUID v4 is always 36 characters: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  if (slug.length >= 36) {
    return slug.slice(-36);
  }
  // Fallback: treat the entire slug as the id
  return slug;
}
