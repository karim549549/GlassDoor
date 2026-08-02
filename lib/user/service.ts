import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";

/**
 * Explicit field allow-list — only what toUserProfileDto() in dto.ts
 * actually maps to a response field. Excludes emailVerified and updatedAt
 * (User has no auth secrets to worry about here since Supabase Auth owns
 * credentials, but the discipline of not fetching unused columns applies
 * regardless — same pattern as ARENA_LIST_SELECT in lib/arena/types.ts).
 */
export const USER_PROFILE_SELECT = {
  id: true,
  fullName: true,
  firstName: true,
  lastName: true,
  handle: true,
  email: true,
  avatarUrl: true,
  coverUrl: true,
  bio: true,
  employmentStatus: true,
  currentEmployer: true,
  seniority: true,
  education: true,
  location: true,
  githubUrl: true,
  linkedinUrl: true,
  portfolioUrl: true,
  rating: true,
  createdAt: true,
  lastActiveAt: true,
  skills: { select: { skill: { select: { id: true, name: true } } } },
  jobTypes: { select: { jobType: { select: { id: true, name: true } } } },
} satisfies Prisma.UserSelect;

type UserProfileRow = Prisma.UserGetPayload<{ select: typeof USER_PROFILE_SELECT }>;

/** Raw Prisma shape — internal only. API responses go through toUserProfileDto() in dto.ts. */
export interface RawUserProfile extends UserProfileRow {
  followersCount: number;
  isFollowing: boolean;
  isOwner: boolean;
}

/**
 * Scoped queries (findUnique + counts) instead of loading every follower row
 * just to compute a count and a membership check.
 */
export async function getUserProfileById(
  id: string,
  viewerId: string | null
): Promise<RawUserProfile | null> {
  const [dbUser, followersCount, followRow] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: USER_PROFILE_SELECT,
    }),
    prisma.follows.count({ where: { followingId: id } }),
    viewerId
      ? prisma.follows.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: id } },
        })
      : Promise.resolve(null),
  ]);

  if (!dbUser) {
    return null;
  }

  return {
    ...dbUser,
    followersCount,
    isFollowing: !!followRow,
    isOwner: viewerId === id,
  };
}
