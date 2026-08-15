import { z } from "zod";
import type { RawUserProfile } from "./service";

/**
 * The API's actual public contract for a user profile — flat, validated,
 * and decoupled from however the Prisma schema happens to shape a many-to-many
 * relation. `skills`/`jobTypes` come back from Prisma as
 * `{ skill: { id, name } }[]` (the join-table row wrapping the thing you
 * actually want) — this flattens that to `{ id, name }[]` before it ever
 * reaches a response. New many-to-many relations (e.g. a future tagging
 * system) should get the same treatment: raw Prisma shape stays internal to
 * the service, a dto.ts flattens + validates before NextResponse.json().
 */
export const userProfileDtoSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  handle: z.string().nullable(),
  // No `email` field: this DTO is the public profile contract and the service's
  // select no longer fetches one. See USER_PROFILE_SELECT in ./service.ts.
  avatarUrl: z.string().nullable(),
  coverUrl: z.string().nullable(),
  bio: z.string().nullable(),
  employmentStatus: z.string().nullable(),
  currentEmployer: z.string().nullable(),
  seniority: z.string().nullable(),
  education: z.string().nullable(),
  location: z.string().nullable(),
  githubUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  rating: z.number(),
  ratingStates: z.array(
    z.object({
      domain: z.string(),
      rating: z.number(),
      deviation: z.number(),
      volatility: z.number(),
    })
  ).default([]),
  createdAt: z.date(),
  lastActiveAt: z.date().nullable(),
  skills: z.array(z.object({ id: z.string(), name: z.string() })),
  jobTypes: z.array(z.object({ id: z.string(), name: z.string() })),
  followersCount: z.number(),
  isFollowing: z.boolean(),
  isOwner: z.boolean(),
});

export type UserProfileDto = z.infer<typeof userProfileDtoSchema>;

export function toUserProfileDto(raw: RawUserProfile): UserProfileDto {
  const primaryRating = raw.ratingStates?.[0]?.rating
    ? Math.round(raw.ratingStates[0].rating)
    : 1500;

  return userProfileDtoSchema.parse({
    ...raw,
    rating: primaryRating,
    ratingStates: raw.ratingStates || [],
    skills: raw.skills.map((s) => s.skill),
    jobTypes: raw.jobTypes.map((j) => j.jobType),
  });
}
