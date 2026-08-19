import * as z from "zod";
import { validateArenaTimeline } from "@/lib/arena/formats";

/**
 * Length bounds, exported so the form can render a counter against the same
 * numbers the API enforces. A counter that disagrees with the validator is
 * worse than no counter: it tells the reader they are fine right up until the
 * request is rejected.
 */
export const TITLE_MAX = 90;
export const DESCRIPTION_MAX = 1200;
/** One rule. Long enough for a sentence, short enough to stay a bullet. */
export const RULE_MAX = 160;
/**
 * How many rules an arena may carry.
 *
 * Not a technical limit - it is the point at which a list stops being rules
 * and becomes terms and conditions, which is not what this field is for.
 */
export const RULES_MAX_COUNT = 12;

/**
 * The enum values, once.
 *
 * They were spelled out inline inside `arenaBaseSchema` and would have had to
 * be spelled out again in the list-query schema and a third time in whatever
 * rendered the filter - which is exactly the drift the domain-schema
 * convention exists to prevent. `lib/arena/taxonomy.ts` holds how they read;
 * this holds what is valid.
 */
export const ARENA_DIFFICULTY_VALUES = [
  "NOVICE",
  "INTERMEDIATE",
  "ADVANCED",
  "GRANDMASTER",
] as const;

/**
 * Base field-level rules, exported separately from `arenaSchema` so callers
 * (e.g. the create form's per-section progress indicator) can validate a
 * subset of fields via `.pick()` without needing the cross-field `.refine()`
 * below, which zod only allows on the full object.
 */
export const arenaBaseSchema = z.object({
  // Upper bounds, not just lower ones. Both fields were open-ended, so the
  // form invited a novel into a field the board renders on one line - and the
  // API accepted it, since `@db.Text` has no length of its own. A ceiling here
  // is the only thing that stops a card layout being decided by whoever typed
  // the most.
  //
  // 90 is about the longest headline that still sets on two lines at the
  // display size the brief is rendered in.
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(TITLE_MAX, `Title must be at most ${TITLE_MAX} characters`),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters`),
  isPrivate: z.boolean().default(false),
  inviteCode: z.string().optional().nullable(),

  // `authority`, `intent`, `format` and `domain` are deliberately NOT here.
  //
  // `authority` used to be accepted from the request body, so any logged-in
  // caller could ask for "OFFICIAL" - the tier PRD 7.1 grants full XP and cash
  // prizes and denies to COMMUNITY. It is derived server-side now, from who is
  // asking: see lib/arena/authority.ts. A field that decides a privilege can
  // never be an input to the request that wants the privilege.
  //
  // `intent` went with it: it is not in the PRD, and it duplicated the
  // distinction `authority` already draws.
  difficulty: z.enum(ARENA_DIFFICULTY_VALUES).default("INTERMEDIATE"),

  // Location
  locationType: z.enum(["ONLINE", "IN_PERSON"]).default("ONLINE"),
  locationName: z.string().optional().nullable(),
  googleMapsUrl: z.string().optional().nullable(),

  // Prize Pool
  hasPrizePool: z.boolean().default(false),
  totalPrizePool: z.coerce.number().optional().nullable(),
  prizeCurrency: z.enum(["EGP", "USD", "EUR", "SAR", "AED"]).default("EGP"),
  firstPlacePrize: z.coerce.number().optional().nullable(),
  secondPlacePrize: z.coerce.number().optional().nullable(),
  thirdPlacePrize: z.coerce.number().optional().nullable(),
  prizeDisbursementTerms: z.string().optional().nullable(),
  requireHiringConsent: z.boolean().default(false),

  // Company association
  companyId: z.string().uuid().optional().nullable(),

  // Timeline
  registrationStart: z.string().min(1, "Registration start date is required"),
  registrationEnd: z.string().min(1, "Registration end date is required"),
  ideaPhaseStart: z.string().min(1, "Idea phase start date is required"),
  ideaPhaseEnd: z.string().min(1, "Idea phase end date is required"),
  implPhaseStart: z.string().min(1, "Implementation phase start date is required"),
  implPhaseEnd: z.string().min(1, "Implementation end date is required"),

  // Teams
  isTeam: z.boolean().default(false),
  minTeamSize: z.coerce.number().min(1, "Min team size is 1").default(1),
  maxTeamSize: z.coerce.number().min(1, "Max team size is 1").default(1),
  maxParticipants: z.coerce.number().optional().nullable(),
  allowLeaderAccessControl: z.boolean().optional().nullable().default(true),

  // Submission Rules
  requireGithubUrl: z.boolean().default(true),
  requireFigmaUrl: z.boolean().default(false),
  requireVideoUrl: z.boolean().default(false),
  requireWriteup: z.boolean().default(true),
  /**
   * House rules, one per entry.
   *
   * Was a single textarea, and every host used it the way the seed data did -
   * a run of short sentences, because that is what rules are. Collecting them
   * as a list means the page can render them as one without guessing where a
   * rule ends, and a host cannot accidentally write a paragraph.
   *
   * Blank entries are dropped rather than rejected: an empty row is somebody
   * mid-thought or a stray Enter, not an error worth blocking a submit on.
   */
  rules: z
    .array(z.string().trim().max(RULE_MAX, `Keep each rule under ${RULE_MAX} characters`))
    .max(RULES_MAX_COUNT, `${RULES_MAX_COUNT} rules is plenty`)
    .default([])
    .transform((entries) => entries.map((r) => r.trim()).filter(Boolean)),

});

/**
 * Single source of truth for arena create/update validation, consumed by
 * both the client form (app/arena/create/page.tsx) and the API route
 * (app/api/arena/route.ts).
 */
export const arenaSchema = arenaBaseSchema
  .refine(
    (data) => new Date(data.registrationEnd) > new Date(data.registrationStart),
    {
      message: "Registration end must be after registration start",
      path: ["registrationEnd"],
    }
  )
  .refine(
    (data) => data.locationType !== "IN_PERSON" || Boolean(data.googleMapsUrl && data.googleMapsUrl.trim().length > 0),
    {
      message: "Google Maps URL or map pin link is required for in-person arenas",
      path: ["googleMapsUrl"],
    }
  )
  .refine(
    (data) => !data.isTeam || typeof data.allowLeaderAccessControl === "boolean",
    {
      message: "Please specify whether team leaders can configure team privacy",
      path: ["allowLeaderAccessControl"],
    }
  )
  // Phase-order check. Without this only the registration pair above was
  // validated, so an arena whose implementation window started before
  // registration closed was creatable - and because status is derived from
  // these timestamps, it reported UNDER_JUDGING from the moment it was
  // published. Adjacent phases may be EQUAL (a host may want no separate
  // planning stage), so the check is "not before", not "strictly after"; see
  // PHASE_ORDER in lib/arena/formats.ts.
  .superRefine((data, ctx) => {
    const result = validateArenaTimeline({
      registrationStart: new Date(data.registrationStart),
      registrationEnd: new Date(data.registrationEnd),
      ideaPhaseStart: new Date(data.ideaPhaseStart),
      ideaPhaseEnd: new Date(data.ideaPhaseEnd),
      implPhaseStart: new Date(data.implPhaseStart),
      implPhaseEnd: new Date(data.implPhaseEnd),
    });

    if (!result.ok) {
      ctx.addIssue({
        code: "custom",
        message: result.reason,
        // Surfaced on the implementation end field: it is the last one in the
        // sequence and the one the create form shows nearest the error.
        path: ["implPhaseEnd"],
      });
    }
  });

export type ArenaFormInput = z.input<typeof arenaSchema>;
export type ArenaFormOutput = z.output<typeof arenaSchema>;

/**
 * The board's axes.
 *
 * These replace a set that did not match what a reader wants to know. Status
 * was `active`/`completed`; you could filter by `access` (why filter *for*
 * arenas you cannot join?); and there was no way to filter by difficulty,
 * online-versus-Cairo or prize - the things that actually decide whether
 * someone enters.
 *
 * There is no domain or tag filter: both taxonomies were removed. See
 * lib/arena/taxonomy.ts and the note on Arena.domain in the Prisma schema.
 *
 * `judging` is deliberately absent. Nothing in the codebase can create a judge
 * assignment yet, so every arena past its build window would sit in it
 * permanently - a tab that is always wrong is worse than a missing one. It
 * returns when judging does.
 */
export const ARENA_STATUS_FILTERS = ["all", "open", "live", "finished"] as const;
/**
 * Multi-select, so an empty set means "no restriction".
 *
 * "all" is gone as a value: it was a third option meaning the absence of the
 * other two, which a set expresses by being empty. Picking both `online` and
 * `in_person` and picking neither now mean the same thing, and both are true.
 */
export const ARENA_PLACE_FILTERS = ["online", "in_person"] as const;
export const ARENA_ENTRY_FILTERS = ["solo", "team"] as const;

/**
 * `closing` is the default, and that matters. The board used to lead with
 * `newest`, so the top of a page whose whole job is "what can I enter" could
 * be arenas that closed weeks ago.
 */
export const ARENA_SORT_OPTIONS = ["closing", "newest", "prize", "entrants", "title"] as const;
export const ARENA_TAB_SCOPES = ["all", "my"] as const;

export type ArenaStatusFilter = (typeof ARENA_STATUS_FILTERS)[number];
export type ArenaPlaceFilter = (typeof ARENA_PLACE_FILTERS)[number];
export type ArenaEntryFilter = (typeof ARENA_ENTRY_FILTERS)[number];
export type ArenaDifficultyFilter = (typeof ARENA_DIFFICULTY_VALUES)[number];

/**
 * A comma-separated list in the query string - `?difficulty=NOVICE,ADVANCED` -
 * rather than a repeated key. Both are valid HTTP; one is readable in an
 * address bar and survives being copied out of it.
 *
 * Unknown values are dropped rather than rejected, and an absent value parses
 * to an empty array. Both mean a malformed filter widens the results instead of
 * emptying them, which is the safer way for a URL someone edited by hand to
 * fail.
 */
const csvOf = <T extends readonly string[]>(values: T) =>
  z
    .string()
    .optional()
    .transform((raw) =>
      (raw ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is T[number] => values.includes(s))
    );
export type ArenaSortOption = (typeof ARENA_SORT_OPTIONS)[number];
export type ArenaTabScope = (typeof ARENA_TAB_SCOPES)[number];

/** Validates GET /api/arena query params. */
export const arenaListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(ARENA_STATUS_FILTERS).default("all"),
  place: csvOf(ARENA_PLACE_FILTERS),
  entry: csvOf(ARENA_ENTRY_FILTERS),
  difficulty: csvOf(ARENA_DIFFICULTY_VALUES),
  /** Only arenas offering prize money. */
  prized: z.coerce.boolean().default(false),
  sortBy: z.enum(ARENA_SORT_OPTIONS).default("closing"),
  tab: z.enum(ARENA_TAB_SCOPES).default("all"),
  search: z.string().trim().default(""),
});

export type ArenaListQuery = z.output<typeof arenaListQuerySchema>;

/** Default params shared by the SSR list page's initial query and the client's initial-fetch defaults. */
export const DEFAULT_LIST_PARAMS: ArenaListQuery = {
  page: 1,
  limit: 50,
  status: "all",
  place: [],
  entry: [],
  difficulty: [],
  prized: false,
  sortBy: "closing",
  tab: "all",
  search: "",
};
