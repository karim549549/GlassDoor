import "server-only";
import { Prisma, type User } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import { EMPLOYER_REQUIRED_STATUSES, type ProfileFormOutput } from "./schema";
import { normalizeSeniority } from "@/lib/taxonomy/seniority";

export type UpdateProfileResult = { user: User } | { error: string };

export async function updateUserProfile(userId: string, data: ProfileFormOutput): Promise<UpdateProfileResult> {
  const processedHandle = data.handle ? data.handle.toLowerCase().replace(/^@/, "") : null;

  // Fast-path friendly check - not the authoritative guard against the race,
  // see the P2002 catch below for that.
  if (processedHandle) {
    const existingUser = await prisma.user.findFirst({
      where: { handle: processedHandle, NOT: { id: userId } },
    });
    if (existingUser) {
      return { error: "Handle is already taken" };
    }
  }

  const parts = data.fullName.trim().split(/\s+/);
  const firstNameVal = parts[0] || null;
  const lastNameVal = parts.slice(1).join(" ") || null;

  const showEmployer = EMPLOYER_REQUIRED_STATUSES.includes(data.employmentStatus);

  const uniqueSkills = [...new Set(data.skills ?? [])];
  const uniqueJobTypes = [...new Set(data.jobTypes)];

  // Batched as a single transaction (array form, not the interactive
  // `async (tx) => {}` form - PgBouncer's transaction-mode pooling can't
  // hold an interactive transaction open across round-trips, same
  // constraint as lib/server/auth/auth-service.ts's syncUser).
  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        firstName: firstNameVal,
        lastName: lastNameVal,
        handle: processedHandle,
        bio: data.bio ?? null,
        employmentStatus: data.employmentStatus,
        currentEmployer: showEmployer ? (data.currentEmployer ?? null) : null,
        // Normalize on write so a profile edited under the legacy scale
        // (JUNIOR/MID/...) is persisted canonically. Over time this drains the
        // legacy spellings out of the column without a bulk migration; the
        // migration still runs, this just stops the set growing meanwhile.
        seniority: normalizeSeniority(data.seniority) ?? data.seniority,
        education: data.education,
        location: data.location,
        githubUrl: data.githubUrl ?? null,
        linkedinUrl: data.linkedinUrl ?? null,
        portfolioUrl: data.portfolioUrl ?? null,
      },
    }),
    prisma.userSkill.deleteMany({ where: { userId } }),
  ];

  if (uniqueSkills.length > 0) {
    ops.push(
      prisma.userSkill.createMany({
        data: uniqueSkills.map((skillId) => ({ userId, skillId })),
      })
    );
  }

  ops.push(prisma.userJobType.deleteMany({ where: { userId } }));

  if (uniqueJobTypes.length > 0) {
    ops.push(
      prisma.userJobType.createMany({
        data: uniqueJobTypes.map((jobTypeId) => ({ userId, jobTypeId })),
      })
    );
  }

  try {
    const [updatedUser] = await prisma.$transaction(ops);
    return { user: updatedUser as User };
  } catch (err) {
    // Authoritative check for the handle race: the pre-check above is only
    // a fast/friendly path, this catch is what actually prevents two
    // concurrent requests from both slipping through with the same handle.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Handle is already taken" };
    }
    throw err;
  }
}
