import "server-only";
import prisma from "@/lib/server/prisma";
import { deriveArenaStatus } from "./status";

export interface SubmissionInput {
  githubUrl: string;
  figmaUrl?: string | null;
  videoUrl?: string | null;
  writeupText: string;
}

export interface SubmissionResult {
  success?: boolean;
  submissionId?: string;
  revisionNumber?: number;
  error?: string;
}

/**
 * Finds the entrant's active ArenaEntry identity (either directly as a solo user
 * or indirectly through team membership).
 */
async function findActiveEntryForUser(arenaId: string, userId: string) {
  const soloEntry = await prisma.arenaEntry.findFirst({
    where: { arenaId, userId, withdrawnAt: null },
  });

  if (soloEntry) return soloEntry;

  const teamMember = await prisma.arenaTeamMember.findFirst({
    where: {
      userId,
      team: { arenaId },
    },
    include: {
      team: {
        include: {
          entries: { where: { arenaId, withdrawnAt: null } },
        },
      },
    },
  });

  if (teamMember?.team.entries[0]) {
    return teamMember.team.entries[0];
  }

  return null;
}

/**
 * Submits or revises an engineering solution for an active arena.
 * Automatically tracks immutable revision snapshots and validates deliverables.
 */
export async function createOrUpdateSubmission(
  arenaId: string,
  userId: string,
  data: SubmissionInput
): Promise<SubmissionResult> {
  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
  });

  if (!arena) {
    return { error: "Arena not found." };
  }

  const now = new Date();
  const status = deriveArenaStatus(arena, now);
  if (status !== "IMPLEMENTATION_PHASE") {
    return { error: `Submissions are only accepted during IMPLEMENTATION_PHASE (current: ${status}).` };
  }

  if (arena.requireGithubUrl && (!data.githubUrl || !data.githubUrl.trim())) {
    return { error: "GitHub repository URL is required by this arena." };
  }

  if (arena.requireFigmaUrl && (!data.figmaUrl || !data.figmaUrl.trim())) {
    return { error: "Figma design specification URL is required by this arena." };
  }

  if (arena.requireVideoUrl && (!data.videoUrl || !data.videoUrl.trim())) {
    return { error: "Video demonstration URL is required by this arena." };
  }

  if (arena.requireWriteup && (!data.writeupText || data.writeupText.trim().length < 20)) {
    return { error: "A technical writeup (minimum 20 characters) is required by this arena." };
  }

  const entry = await findActiveEntryForUser(arenaId, userId);
  if (!entry) {
    return { error: "You must be an active registered participant to submit deliverables." };
  }

  const existing = await prisma.arenaSubmission.findUnique({
    where: { entryId: entry.id },
    include: { revisions: { orderBy: { revisionNumber: "desc" } } },
  });

  if (existing) {
    const nextRevisionNum = (existing.revisions[0]?.revisionNumber || 1) + 1;

    return await prisma.$transaction(async (tx) => {
      // Record current work as a revision before updating
      await tx.arenaSubmissionRevision.create({
        data: {
          submissionId: existing.id,
          revisionNumber: nextRevisionNum,
          githubUrl: data.githubUrl.trim(),
          figmaUrl: data.figmaUrl?.trim() || null,
          videoUrl: data.videoUrl?.trim() || null,
          writeupText: data.writeupText.trim(),
        },
      });

      const updated = await tx.arenaSubmission.update({
        where: { id: existing.id },
        data: {
          githubUrl: data.githubUrl.trim(),
          figmaUrl: data.figmaUrl?.trim() || null,
          videoUrl: data.videoUrl?.trim() || null,
          writeupText: data.writeupText.trim(),
          submittedAt: new Date(),
        },
      });

      return {
        success: true,
        submissionId: updated.id,
        revisionNumber: nextRevisionNum,
      };
    });
  }

  return await prisma.$transaction(async (tx) => {
    const submission = await tx.arenaSubmission.create({
      data: {
        arenaId,
        entryId: entry.id,
        githubUrl: data.githubUrl.trim(),
        figmaUrl: data.figmaUrl?.trim() || null,
        videoUrl: data.videoUrl?.trim() || null,
        writeupText: data.writeupText.trim(),
      },
    });

    await tx.arenaSubmissionRevision.create({
      data: {
        submissionId: submission.id,
        revisionNumber: 1,
        githubUrl: data.githubUrl.trim(),
        figmaUrl: data.figmaUrl?.trim() || null,
        videoUrl: data.videoUrl?.trim() || null,
        writeupText: data.writeupText.trim(),
      },
    });

    return {
      success: true,
      submissionId: submission.id,
      revisionNumber: 1,
    };
  });
}

/**
 * Gets a user's active submission for an arena.
 */
export async function getEntrantSubmission(arenaId: string, userId: string) {
  const entry = await findActiveEntryForUser(arenaId, userId);
  if (!entry) return null;

  return prisma.arenaSubmission.findUnique({
    where: { entryId: entry.id },
    include: {
      revisions: { orderBy: { revisionNumber: "asc" } },
      commits: { orderBy: { committedAt: "desc" } },
    },
  });
}
