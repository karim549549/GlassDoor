import { z } from "zod";
import {
  CONTACT_WITHHELD_REASON,
  type PipelineResult,
  type RawPipelineCandidate,
} from "./pipeline-service";

/**
 * The recruiter pipeline's public contract.
 *
 * Two things this flattens: the nested `user` relation (the service returns the
 * Prisma shape `{ user: { id, fullName, ... }, ratings, ... }`; a recruiter row
 * is flat), and `ratings`, which is a per-domain `RatingState[]` internally.
 *
 * One thing it guarantees structurally: `contactEmail` is typed `null`. It is
 * not "optional" or "nullable" — it is a null literal, so a future change that
 * starts passing an email through will fail validation here rather than
 * silently shipping personal data to a paying customer without consent.
 */
export const pipelineCandidateDtoSchema = z.object({
  userId: z.string(),
  fullName: z.string().nullable(),
  handle: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  seniority: z.string().nullable(),
  location: z.string().nullable(),
  ratings: z.array(
    z.object({
      domain: z.string(),
      rating: z.number(),
      deviation: z.number(),
    })
  ),
  bestRating: z.number().nullable(),
  arenasCompleted: z.number(),
  topScore: z.number(),
  proofPacketSlug: z.string().nullable(),
  hasProofPacket: z.boolean(),
  hiringConsentArenaCount: z.number(),
  contactEmail: z.null(),
});

export type PipelineCandidateDto = z.infer<typeof pipelineCandidateDtoSchema>;

export const pipelineResponseDtoSchema = z.object({
  candidates: z.array(pipelineCandidateDtoSchema),
  total: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  scannedSubmissionCap: z.boolean(),
  contactWithheldReason: z.string(),
});

export type PipelineResponseDto = z.infer<typeof pipelineResponseDtoSchema>;

export function toPipelineCandidateDto(raw: RawPipelineCandidate): PipelineCandidateDto {
  return pipelineCandidateDtoSchema.parse({
    userId: raw.user.id,
    fullName: raw.user.fullName,
    handle: raw.user.handle,
    avatarUrl: raw.user.avatarUrl,
    seniority: raw.user.seniority,
    location: raw.user.location,
    ratings: raw.ratings.map((r) => ({
      domain: r.domain,
      rating: Math.round(r.rating),
      deviation: Math.round(r.deviation),
    })),
    bestRating: raw.bestRating === null ? null : Math.round(raw.bestRating),
    arenasCompleted: raw.arenasCompleted,
    topScore: Math.round(raw.topScore * 10) / 10,
    proofPacketSlug: raw.proofPacketSlug,
    hasProofPacket: raw.proofPacketSlug !== null,
    hiringConsentArenaCount: raw.hiringConsentArenaCount,
    contactEmail: null,
  });
}

export function toPipelineResponseDto(result: PipelineResult, currentPage: number): PipelineResponseDto {
  return pipelineResponseDtoSchema.parse({
    candidates: result.candidates.map(toPipelineCandidateDto),
    total: result.total,
    totalPages: result.totalPages,
    currentPage,
    scannedSubmissionCap: result.scannedSubmissionCap,
    contactWithheldReason: CONTACT_WITHHELD_REASON,
  });
}

const CSV_COLUMNS = [
  "userId",
  "fullName",
  "handle",
  "seniority",
  "location",
  "bestRating",
  "arenasCompleted",
  "topScore",
  "proofPacketSlug",
  "contactEmail",
] as const;

/**
 * Quotes every field and doubles embedded quotes. The leading-character guard
 * neutralizes CSV injection: a `fullName` of `=cmd|...` would otherwise execute
 * as a formula when the export is opened in Excel.
 */
function csvCell(value: string | number | null): string {
  const raw = value === null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toPipelineCsv(candidates: PipelineCandidateDto[]): string {
  const rows = candidates.map((c) =>
    CSV_COLUMNS.map((column) => csvCell(c[column])).join(",")
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\r\n");
}
