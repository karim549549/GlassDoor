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
export const RULES_MAX = 2000;

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

  // Format, Authority, Domain & Difficulty
  format: z.enum(["REP", "LIVE", "ARENA"]).default("ARENA"),
  // `authority` and `intent` are deliberately NOT here.
  //
  // `authority` used to be accepted from the request body, so any logged-in
  // caller could ask for "OFFICIAL" - the tier PRD 7.1 grants full XP and cash
  // prizes and denies to COMMUNITY. It is derived server-side now, from who is
  // asking: see lib/arena/authority.ts. A field that decides a privilege can
  // never be an input to the request that wants the privilege.
  //
  // `intent` went with it: it is not in the PRD, and it duplicated the
  // distinction `authority` already draws.
  domain: z
    .enum([
      "FULL_STACK_WEB",
      "BACKEND_DISTRIBUTED",
      "FRONTEND_MOBILE",
      "AI_MACHINE_LEARNING",
      "DATA_ENGINEERING",
      "CYBERSECURITY_ETHICAL_HACKING",
      "SYSTEMS_DEV_OPS",
      "EMBEDDED_IOT",
      "BLOCKCHAIN_WEB3",
    ])
    .default("FULL_STACK_WEB"),
  difficulty: z.enum(["NOVICE", "INTERMEDIATE", "ADVANCED", "GRANDMASTER"]).default("INTERMEDIATE"),

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
  rulesText: z
    .string()
    .max(RULES_MAX, `Rules must be at most ${RULES_MAX} characters`)
    .default(""),

  // Tags (IDs or Slugs)
  tags: z.array(z.string()).default([]),
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
  // Full phase-order and per-format duration check. Without this only the
  // registration pair above was validated, so an arena whose implementation
  // window started before registration closed was creatable - and because
  // status is derived from these timestamps, it reported UNDER_JUDGING from the
  // moment it was published. Adjacent phases may be EQUAL (a 90-minute REP has
  // a zero-width idea window), so the check is "not before", not "strictly
  // after"; see PHASE_ORDER in lib/arena/formats.ts.
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

export const ARENA_STATUS_FILTERS = ["all", "open", "active", "completed"] as const;
export const ARENA_ACCESS_FILTERS = ["all", "public", "private"] as const;
export const ARENA_SORT_OPTIONS = ["newest", "oldest", "title", "teams"] as const;
export const ARENA_TAB_SCOPES = ["all", "my"] as const;

export type ArenaStatusFilter = (typeof ARENA_STATUS_FILTERS)[number];
export type ArenaAccessFilter = (typeof ARENA_ACCESS_FILTERS)[number];
export type ArenaSortOption = (typeof ARENA_SORT_OPTIONS)[number];
export type ArenaTabScope = (typeof ARENA_TAB_SCOPES)[number];

/** Validates GET /api/arena query params. */
export const arenaListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(ARENA_STATUS_FILTERS).default("all"),
  access: z.enum(ARENA_ACCESS_FILTERS).default("all"),
  sortBy: z.enum(ARENA_SORT_OPTIONS).default("newest"),
  tab: z.enum(ARENA_TAB_SCOPES).default("all"),
  search: z.string().trim().default(""),
  tag: z.string().optional(),
});

export type ArenaListQuery = z.output<typeof arenaListQuerySchema>;

/** Default params shared by the SSR list page's initial query and the client's initial-fetch defaults. */
export const DEFAULT_LIST_PARAMS: ArenaListQuery = {
  page: 1,
  limit: 50,
  status: "all",
  access: "all",
  sortBy: "newest",
  tab: "all",
  search: "",
};
