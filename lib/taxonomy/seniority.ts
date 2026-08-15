/**
 * The single source of truth for seniority levels.
 *
 * Three incompatible scales existed before this file: `SENIORITY_VALUES` in
 * lib/profile/schema.ts (JUNIOR/MID/SENIOR/LEAD/MANAGER), a differently-cased
 * six-value `SENIORITY_VALUES` in lib/companies/schema.ts (Junior/Mid/Senior/
 * Team Lead/Architect/Principal), and a display-label map inside an edit-form
 * component. Same exported symbol name, two modules, incompatible casing and
 * cardinality - and both persisted into untyped `String` columns, so the
 * database already holds both dialects.
 *
 * The canonical set below is the PRD's. Note the deliberate split between what
 * we ACCEPT and what we EMIT: `SENIORITY_INPUT_VALUES` still admits the legacy
 * profile spellings so existing rows keep validating on edit, while
 * `normalizeSeniority` maps everything to a canonical value on write. Once the
 * data migration has run `UPDATE users SET seniority = ...`, drop
 * `LEGACY_SENIORITY_MAP` and narrow the input set to the canonical one.
 */

export const SENIORITY_VALUES = [
  "ENTRY_LEVEL",
  "MID_LEVEL",
  "SENIOR_LEVEL",
  "LEAD_STAFF",
] as const;

export type Seniority = (typeof SENIORITY_VALUES)[number];

/** Human-readable labels. Components must render these, never hardcode their own. */
export const SENIORITY_LABELS: Record<Seniority, string> = {
  ENTRY_LEVEL: "Entry level (0-2 years)",
  MID_LEVEL: "Mid level (2-5 years)",
  SENIOR_LEVEL: "Senior (5-8 years)",
  LEAD_STAFF: "Lead / Staff (8+ years)",
};

/**
 * Historic spellings that may still be sitting in `users.seniority`.
 * MANAGER folds into LEAD_STAFF: the canonical scale measures engineering
 * seniority, and there is no separate management track in the PRD.
 */
export const LEGACY_SENIORITY_MAP: Record<string, Seniority> = {
  JUNIOR: "ENTRY_LEVEL",
  MID: "MID_LEVEL",
  SENIOR: "SENIOR_LEVEL",
  LEAD: "LEAD_STAFF",
  MANAGER: "LEAD_STAFF",
};

/** Everything a form is allowed to submit: canonical values plus legacy rows. */
export const SENIORITY_INPUT_VALUES: readonly string[] = [
  ...SENIORITY_VALUES,
  ...Object.keys(LEGACY_SENIORITY_MAP),
];

export function isSeniority(value: string): value is Seniority {
  return (SENIORITY_VALUES as readonly string[]).includes(value);
}

/** Maps any accepted spelling to its canonical value; null if unrecognized. */
export function normalizeSeniority(value: string | null | undefined): Seniority | null {
  if (!value) return null;
  const upper = value.trim().toUpperCase().replace(/\s+/g, "_");
  if (isSeniority(upper)) return upper;
  return LEGACY_SENIORITY_MAP[upper] ?? null;
}
