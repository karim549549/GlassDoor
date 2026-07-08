import * as z from "zod";

/**
 * Base field-level rules, exported separately from `contestSchema` so callers
 * (e.g. the create form's per-section progress indicator) can validate a
 * subset of fields via `.pick()` without needing the cross-field `.refine()`
 * below, which zod only allows on the full object.
 */
export const contestBaseSchema = z.object({
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
  rulesText: z.string().min(10, "Please provide some rules for the contest"),
});

/**
 * Single source of truth for contest create/update validation, consumed by
 * both the client form (app/contest/create/page.tsx) and the API route
 * (app/api/contest/route.ts). Cover image is required to match the create
 * flow's UX (the cropper/upload step is front and center in the form).
 */
export const contestSchema = contestBaseSchema.refine(
  (data) => new Date(data.registrationEnd) > new Date(data.registrationStart),
  {
    message: "Registration end must be after registration start",
    path: ["registrationEnd"],
  }
);

export type ContestFormInput = z.input<typeof contestSchema>;
export type ContestFormOutput = z.output<typeof contestSchema>;

export const CONTEST_STATUS_FILTERS = ["all", "open", "active", "completed"] as const;
export const CONTEST_ACCESS_FILTERS = ["all", "public", "private"] as const;
export const CONTEST_SORT_OPTIONS = ["newest", "oldest", "title", "teams"] as const;
export const CONTEST_TAB_SCOPES = ["all", "my"] as const;

export type ContestStatusFilter = (typeof CONTEST_STATUS_FILTERS)[number];
export type ContestAccessFilter = (typeof CONTEST_ACCESS_FILTERS)[number];
export type ContestSortOption = (typeof CONTEST_SORT_OPTIONS)[number];
export type ContestTabScope = (typeof CONTEST_TAB_SCOPES)[number];

/** Validates GET /api/contest query params instead of raw parseInt/string parsing. */
export const contestListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(CONTEST_STATUS_FILTERS).default("all"),
  access: z.enum(CONTEST_ACCESS_FILTERS).default("all"),
  sortBy: z.enum(CONTEST_SORT_OPTIONS).default("newest"),
  tab: z.enum(CONTEST_TAB_SCOPES).default("all"),
  search: z.string().trim().default(""),
});

export type ContestListQuery = z.output<typeof contestListQuerySchema>;

/** Default params shared by the SSR list page's initial query and the client's initial-fetch defaults. */
export const DEFAULT_LIST_PARAMS: ContestListQuery = {
  page: 1,
  limit: 50,
  status: "all",
  access: "all",
  sortBy: "newest",
  tab: "all",
  search: "",
};
