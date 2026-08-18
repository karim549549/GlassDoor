import * as z from "zod";

/**
 * The public name in a profile URL: /u/karim rather than
 * /user/8f3c1a2e-....
 *
 * `handle` has been on the User model as `String? @unique` since the schema was
 * written, and nothing ever set it - so every profile addressed itself by uuid,
 * which is unmemorable, unshareable and leaks an internal identifier into a URL
 * people are meant to put on a CV.
 *
 * Kept out of any `server-only` module on purpose: the signup form and the
 * signup route both validate against this, and a rule enforced in one place but
 * not the other is exactly the drift the domain-schema convention exists to
 * prevent.
 */
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 20;

/**
 * Lowercase only, and a letter first.
 *
 * Case-insensitive uniqueness is not something Postgres gives for free on a
 * plain unique index, so allowing capitals would let "Karim" and "karim" both
 * exist and read as the same person. Normalising to lowercase at the boundary
 * makes the existing constraint sufficient. Leading digits are refused so a
 * handle can never be confused with an id.
 */
const HANDLE_PATTERN = /^[a-z][a-z0-9_]{2,19}$/;

/**
 * Names nobody may take. Two separate jobs:
 *
 *  - route names, so a future bare /[handle] cannot be shadowed by a user, and
 *    so /u/support does not read as an official page;
 *  - impersonation, which is the real one. A handle sits next to judge
 *    reasoning and scores; "admin", "staff" or "devsarena" appearing there
 *    would carry authority the account does not have.
 */
const RESERVED = new Set([
  // route names, current and plausible
  "about", "admin", "api", "arena", "arenas", "auth", "billboard", "companies",
  "company", "dashboard", "docs", "faq", "feed", "forgot_password", "help",
  "home", "judge", "judging", "leaderboard", "login", "logout", "me", "new",
  "notifications", "privacy", "profile", "proof", "recruiter", "root",
  "search", "settings", "signup", "support", "team", "teams", "terms", "user",
  "users",
  // identity and authority
  "devsarena", "devs_arena", "moderator", "moderators", "mod", "official",
  "staff", "system", "security", "abuse", "postmaster", "webmaster",
  "everyone", "here", "null", "undefined", "anonymous", "deleted",
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED.has(handle.trim().toLowerCase());
}

/**
 * Lowercases and trims before validating, so a reader typing "Karim" gets the
 * account they expect rather than an error about capitals.
 */
export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(HANDLE_MIN, `Handle must be at least ${HANDLE_MIN} characters`)
  .max(HANDLE_MAX, `Handle must be at most ${HANDLE_MAX} characters`)
  .regex(
    HANDLE_PATTERN,
    "Handle must start with a letter and use only lowercase letters, numbers and underscores"
  )
  .refine((value) => !isReservedHandle(value), { message: "That handle is reserved" });

/**
 * A starting point for the signup field, derived from whatever name was typed.
 *
 * Only a suggestion - it is prefilled, editable, and still validated. Returns
 * null rather than a mangled string when nothing usable survives, so the field
 * is left empty instead of pre-filled with something the reader has to delete.
 */
export function suggestHandle(fullName: string | null | undefined): string | null {
  if (!fullName) return null;

  const base = fullName
    .toLowerCase()
    .normalize("NFD")
    // strip diacritics, then anything that is not a permitted character
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^[^a-z]+/, "")
    .replace(/_+$/, "")
    .slice(0, HANDLE_MAX);

  if (base.length < HANDLE_MIN) return null;
  if (isReservedHandle(base)) return null;

  return base;
}
