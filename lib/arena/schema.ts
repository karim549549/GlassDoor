import * as z from "zod";

/**
 * Base field-level rules, exported separately from `arenaSchema` so callers
 * (e.g. the create form's per-section progress indicator) can validate a
 * subset of fields via `.pick()` without needing the cross-field `.refine()`
 * below, which zod only allows on the full object.
 */
export const arenaBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  coverImageUrl: z.string().min(1, "Cover image upload is required").url("Must be a valid URL"),
  isPrivate: z.boolean().default(false),
  inviteCode: z.string().optional().nullable(),

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

  // Submission Rules
  requireGithubUrl: z.boolean().default(true),
  requireFigmaUrl: z.boolean().default(false),
  requireVideoUrl: z.boolean().default(false),
  requireWriteup: z.boolean().default(true),
  rulesText: z.string().min(10, "Please provide some rules for the arena"),
});

/**
 * Single source of truth for arena create/update validation, consumed by
 * both the client form (app/arena/create/page.tsx) and the API route
 * (app/api/arena/route.ts). Cover image is required to match the create
 * flow's UX.
 */
export const arenaSchema = arenaBaseSchema.refine(
  (data) => new Date(data.registrationEnd) > new Date(data.registrationStart),
  {
    message: "Registration end must be after registration start",
    path: ["registrationEnd"],
  }
);

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
