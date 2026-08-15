import { z } from "zod";

/**
 * Mirrors `RatingDomain` in prisma/schema/arena/arena.prisma. Exported so the
 * pipeline filter's <select> and the route's validation read the same list.
 */
export const RATING_DOMAIN_VALUES = [
  "FULL_STACK_WEB",
  "BACKEND_DISTRIBUTED",
  "FRONTEND_MOBILE",
  "AI_MACHINE_LEARNING",
  "DATA_ENGINEERING",
  "CYBERSECURITY_ETHICAL_HACKING",
  "SYSTEMS_DEV_OPS",
  "EMBEDDED_IOT",
  "BLOCKCHAIN_WEB3",
] as const;

export type RatingDomainValue = (typeof RATING_DOMAIN_VALUES)[number];

export const RATING_DOMAIN_LABELS: Record<RatingDomainValue, string> = {
  FULL_STACK_WEB: "Full-stack web",
  BACKEND_DISTRIBUTED: "Backend / distributed",
  FRONTEND_MOBILE: "Frontend / mobile",
  AI_MACHINE_LEARNING: "AI / machine learning",
  DATA_ENGINEERING: "Data engineering",
  CYBERSECURITY_ETHICAL_HACKING: "Cybersecurity",
  SYSTEMS_DEV_OPS: "Systems / DevOps",
  EMBEDDED_IOT: "Embedded / IoT",
  BLOCKCHAIN_WEB3: "Blockchain / web3",
};

/**
 * `companyId` is present as a *filter* only, for a user who belongs to more
 * than one company. It is never the authorization input: the route resolves
 * the caller's memberships from the database and intersects this value with
 * them, so a company id the caller does not belong to yields 403, not another
 * company's pipeline.
 */
export const pipelineQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  domain: z.enum(RATING_DOMAIN_VALUES).optional(),
  minRating: z.coerce.number().min(0).max(4000).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type PipelineQuery = z.infer<typeof pipelineQuerySchema>;

/** POST body for an export. Same filters, plus the format. */
export const pipelineExportSchema = pipelineQuerySchema.extend({
  format: z.enum(["csv"]).default("csv"),
  pageSize: z.coerce.number().int().min(1).max(1000).default(500),
});

export type PipelineExportInput = z.infer<typeof pipelineExportSchema>;
