import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";

export const USER_PROFILE_SELECT = {
  id: true,
  fullName: true,
  firstName: true,
  lastName: true,
  handle: true,
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
  ratingStates: {
    select: { domain: true, rating: true, deviation: true, volatility: true },
    orderBy: { rating: "desc" },
  },
  createdAt: true,
  lastActiveAt: true,
  skills: { select: { skill: { select: { id: true, name: true } } } },
  jobTypes: { select: { jobType: { select: { id: true, name: true } } } },
  arenaEntries: {
    where: { withdrawnAt: null },
    select: {
      id: true,
      joinedAt: true,
      arena: {
        select: {
          id: true,
          title: true,
          domain: true,
          difficulty: true,
        },
      },
      submission: {
        select: {
          id: true,
          finalScore: true,
          githubUrl: true,
          videoUrl: true,
          createdAt: true,
          proofPacket: {
            select: {
              slug: true,
              contentHash: true,
              issuedAt: true,
              isRevoked: true,
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  },
} satisfies Prisma.UserSelect;

type UserProfileRow = Prisma.UserGetPayload<{ select: typeof USER_PROFILE_SELECT }>;

export interface RawUserProfile extends UserProfileRow {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwner: boolean;
}

/**
 * Free for the taking?
 *
 * A pre-check, not the guarantee - the unique index is that, and the signup
 * route still handles the constraint violation for the narrow race between
 * this call and the insert. What this buys is the common case: a clear "that
 * handle is taken" before a Supabase account has been created for it.
 */
export async function isHandleAvailable(handle: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { handle },
    select: { id: true },
  });
  return existing === null;
}

export async function getUserProfileByHandle(
  handle: string,
  viewerId: string | null
): Promise<RawUserProfile | null> {
  const row = await prisma.user.findUnique({
    where: { handle },
    select: { id: true },
  });
  if (!row) return null;
  return getUserProfileById(row.id, viewerId);
}

export async function getUserProfileById(
  id: string,
  viewerId: string | null
): Promise<RawUserProfile | null> {
  const [dbUser, followersCount, followingCount, followRow] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: USER_PROFILE_SELECT,
    }),
    prisma.follows.count({ where: { followingId: id } }),
    prisma.follows.count({ where: { followerId: id } }),
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
    followingCount,
    isFollowing: !!followRow,
    isOwner: viewerId === id,
  };
}
