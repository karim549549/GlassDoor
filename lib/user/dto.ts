import { z } from "zod";
import type { RawUserProfile } from "./service";

export const userProfileDtoSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  handle: z.string().nullable(),
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
  ratingStates: z
    .array(
      z.object({
        domain: z.string(),
        rating: z.number(),
        deviation: z.number(),
        volatility: z.number(),
      })
    )
    .default([]),
  createdAt: z.date(),
  lastActiveAt: z.date().nullable(),
  skills: z.array(z.object({ id: z.string(), name: z.string() })),
  jobTypes: z.array(z.object({ id: z.string(), name: z.string() })),
  followersCount: z.number(),
  followingCount: z.number().default(0),
  isFollowing: z.boolean(),
  isOwner: z.boolean(),
  arenaEntries: z
    .array(
      z.object({
        id: z.string(),
        joinedAt: z.date(),
        /**
         * `format` used to be required here. The column was dropped, the
         * service select stopped asking for it, and this schema kept demanding
         * it - so the first person to enter an arena would have made every
         * request that renders their profile throw at parse time:
         * `/api/user/[id]`, `/u/[handle]` and `/user/[id]` alike. It never
         * fired only because no `ArenaEntry` row existed to run the inner
         * schema against.
         */
        arena: z.object({
          id: z.string(),
          title: z.string(),
          domain: z.string(),
          difficulty: z.string(),
        }),
        submission: z
          .object({
            id: z.string(),
            finalScore: z.number().nullable(),
            githubUrl: z.string(),
            videoUrl: z.string().nullable(),
            createdAt: z.date(),
            proofPacket: z
              .object({
                slug: z.string(),
                contentHash: z.string(),
                issuedAt: z.date(),
                isRevoked: z.boolean(),
              })
              .nullable(),
          })
          .nullable(),
      })
    )
    .default([]),
});

export type UserProfileDto = z.infer<typeof userProfileDtoSchema>;

export function toUserProfileDto(raw: RawUserProfile): UserProfileDto {
  const primaryRating = raw.ratingStates?.[0]?.rating
    ? Math.round(raw.ratingStates[0].rating)
    : 1500;

  const flattenedSkills = raw.skills.map((s) => s.skill);
  const flattenedJobTypes = raw.jobTypes.map((j) => j.jobType);

  return userProfileDtoSchema.parse({
    ...raw,
    skills: flattenedSkills,
    jobTypes: flattenedJobTypes,
    rating: primaryRating,
    followingCount: raw.followingCount ?? 0,
    arenaEntries: raw.arenaEntries ?? [],
  });
}
