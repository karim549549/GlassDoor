import "server-only";
import prisma from "@/lib/server/prisma";

/** Raw Prisma shape — internal only. API responses go through toUserProfileDto() in dto.ts. */
export interface RawUserProfile {
  id: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  handle: string | null;
  email: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  employmentStatus: string | null;
  currentEmployer: string | null;
  seniority: string | null;
  education: string | null;
  location: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  rating: number;
  createdAt: Date;
  lastActiveAt: Date | null;
  skills: { skill: { id: string; name: string } }[];
  jobTypes: { jobType: { id: string; name: string } }[];
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
      include: {
        skills: { include: { skill: true } },
        jobTypes: { include: { jobType: true } },
      },
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
    id: dbUser.id,
    fullName: dbUser.fullName,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    handle: dbUser.handle,
    email: dbUser.email,
    avatarUrl: dbUser.avatarUrl,
    coverUrl: dbUser.coverUrl,
    bio: dbUser.bio,
    employmentStatus: dbUser.employmentStatus,
    currentEmployer: dbUser.currentEmployer,
    seniority: dbUser.seniority,
    education: dbUser.education,
    location: dbUser.location,
    githubUrl: dbUser.githubUrl,
    linkedinUrl: dbUser.linkedinUrl,
    portfolioUrl: dbUser.portfolioUrl,
    rating: dbUser.rating,
    createdAt: dbUser.createdAt,
    lastActiveAt: dbUser.lastActiveAt,
    skills: dbUser.skills,
    jobTypes: dbUser.jobTypes,
    followersCount,
    isFollowing: !!followRow,
    isOwner: viewerId === id,
  };
}
