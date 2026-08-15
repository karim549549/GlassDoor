import { z } from "zod";

/**
 * Single source of truth for the governance enums and request validation.
 *
 * The enum tuples below mirror `prisma/schema/governance/governance.prisma`.
 * They are exported so the dispute form's <select> options and the route
 * handler's validation read the same list — never hardcode these values in a
 * component or a route-local const.
 */
export const NOTIFICATION_KIND_VALUES = [
  "ARENA_STARTING",
  "ARENA_RESULTS_PUBLISHED",
  "CONNECTION_JOINED_ARENA",
  "JUDGE_ASSIGNED",
  "SUBMISSION_SCORED",
  "APPEAL_RESOLVED",
  "PROOF_PACKET_ISSUED",
  "COMPANY_INVITE",
] as const;

export const DISPUTE_CATEGORY_VALUES = [
  "PLAGIARISM_STOLEN_CODE",
  "RULE_VIOLATION",
  "BROKEN_OR_FAKE_SUBMISSION",
  "ABUSIVE_HARASSMENT",
  "SPAM_OR_OFF_TOPIC",
] as const;

export const DISPUTE_STATUS_VALUES = ["OPEN", "UNDER_REVIEW", "UPHELD", "DISMISSED"] as const;

/** Statuses a moderator can move a dispute into when resolving it. */
export const DISPUTE_RESOLUTION_STATUS_VALUES = ["UNDER_REVIEW", "UPHELD", "DISMISSED"] as const;

export const DISPUTE_CATEGORY_LABELS: Record<(typeof DISPUTE_CATEGORY_VALUES)[number], string> = {
  PLAGIARISM_STOLEN_CODE: "Plagiarism / stolen code",
  RULE_VIOLATION: "Rule violation",
  BROKEN_OR_FAKE_SUBMISSION: "Broken or fake submission",
  ABUSIVE_HARASSMENT: "Abuse or harassment",
  SPAM_OR_OFF_TOPIC: "Spam or off-topic",
};

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;

/**
 * The PATCH body. Deliberately has no `userId`: the owner is always derived
 * from the session, never from the request, so one user can never mark another
 * user's notifications read.
 */
export const notificationMarkReadSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(100).optional(),
    all: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.all) || (data.ids?.length ?? 0) > 0, {
    message: "Provide either `ids` or `all: true`.",
  });

export type NotificationMarkReadInput = z.infer<typeof notificationMarkReadSchema>;

/**
 * Exactly one target must be set. Which one is implied by the category
 * (plagiarism targets a submission, harassment a comment), but rather than
 * hardcode that mapping here — categories move around — this only enforces the
 * structural rule the schema comment states: one target, not zero, not three.
 */
export const disputeCreateSchema = z
  .object({
    category: z.enum(DISPUTE_CATEGORY_VALUES),
    detail: z.string().trim().min(20, "Describe the issue in at least 20 characters").max(4000),
    arenaId: z.string().uuid().optional(),
    submissionId: z.string().uuid().optional(),
    commentId: z.string().uuid().optional(),
  })
  .refine(
    (data) => [data.arenaId, data.submissionId, data.commentId].filter(Boolean).length === 1,
    { message: "Exactly one of arenaId, submissionId or commentId must be provided." }
  );

export type DisputeCreateInput = z.infer<typeof disputeCreateSchema>;

export const disputeListQuerySchema = z.object({
  /**
   * `mine` is the only scope a non-moderator may use. `all` is gated on the
   * ADMIN platform role in the route handler — a reporter sees their own
   * disputes and nobody else's.
   */
  scope: z.enum(["mine", "all"]).default("all"),
  status: z.enum(DISPUTE_STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type DisputeListQuery = z.infer<typeof disputeListQuerySchema>;

export const disputeResolveSchema = z.object({
  disputeId: z.string().uuid(),
  status: z.enum(DISPUTE_RESOLUTION_STATUS_VALUES),
  resolutionNote: z.string().trim().min(1, "A resolution note is required").max(4000),
});

export type DisputeResolveInput = z.infer<typeof disputeResolveSchema>;
