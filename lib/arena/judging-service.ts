import "server-only";
import prisma from "@/lib/server/prisma";
import { deriveArenaStatus } from "./status";

export interface CriterionScoreInput {
  criterionId: string;
  score: number;
  justification: string;
}

export interface SubmitVerdictInput {
  assignmentId: string;
  judgeUserId: string;
  scores: CriterionScoreInput[];
  feedbackText?: string | null;
}

export interface JudgingResult {
  success?: boolean;
  verdictId?: string;
  finalScore?: number;
  error?: string;
}

/**
 * Validates and records a judge's rubric-based evaluation for an assigned submission.
 * Enforces non-empty justifications, conflict-of-interest checks, and weighted scoring.
 */
export async function submitJudgeVerdict(input: SubmitVerdictInput): Promise<JudgingResult> {
  const assignment = await prisma.judgeAssignment.findUnique({
    where: { id: input.assignmentId },
    include: {
      judge: {
        include: {
          arena: true,
          conflicts: true,
        },
      },
      submission: {
        include: {
          entry: {
            include: {
              team: { include: { members: true } },
            },
          },
        },
      },
    },
  });

  if (!assignment) {
    return { error: "Judge assignment not found." };
  }

  if (assignment.judge.userId !== input.judgeUserId) {
    return { error: "Forbidden. You are not assigned to evaluate this submission." };
  }

  const arena = assignment.judge.arena;
  const status = deriveArenaStatus(arena, new Date());
  if (status !== "UNDER_JUDGING") {
    return { error: `Judging is only permitted during UNDER_JUDGING phase (current: ${status}).` };
  }

  // Conflict of interest check: Judge cannot evaluate their own work or team
  const entry = assignment.submission.entry;
  const entrantUserIds: string[] = [];
  if (entry.userId) entrantUserIds.push(entry.userId);
  if (entry.team) {
    entrantUserIds.push(...entry.team.members.map((m) => m.userId));
  }

  if (entrantUserIds.includes(input.judgeUserId)) {
    return { error: "Conflict of Interest: You cannot evaluate a submission from your own entry or squad." };
  }

  // Check declared conflicts
  const hasDeclaredConflict = assignment.judge.conflicts.some((c) =>
    entrantUserIds.includes(c.userId)
  );
  if (hasDeclaredConflict) {
    return { error: "Conflict of Interest: You have a registered conflict with this entrant." };
  }

  if (!input.scores || input.scores.length === 0) {
    return { error: "At least one rubric criterion score is required." };
  }

  for (const s of input.scores) {
    if (!s.justification || s.justification.trim().length < 5) {
      return { error: "Every criterion score requires a clear written justification (min 5 chars)." };
    }
    if (s.score < 0) {
      return { error: "Scores cannot be negative." };
    }
  }

  // Retrieve criteria weights to calculate weighted average
  const criteria = await prisma.rubricCriterion.findMany({
    where: { id: { in: input.scores.map((s) => s.criterionId) } },
  });

  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const s of input.scores) {
    const crit = criteriaMap.get(s.criterionId);
    if (!crit) {
      return { error: `Invalid criterion ID: ${s.criterionId}` };
    }
    if (s.score > crit.maxScore) {
      return { error: `Score ${s.score} exceeds maximum allowed score of ${crit.maxScore} for "${crit.title}".` };
    }
    totalWeightedScore += s.score * crit.weight;
    totalWeight += crit.weight;
  }

  const finalScore = totalWeight > 0 ? Number((totalWeightedScore / totalWeight).toFixed(2)) : 0;

  return await prisma.$transaction(async (tx) => {
    // Upsert each criterion score
    for (const s of input.scores) {
      await tx.judgeScore.upsert({
        where: {
          assignmentId_criterionId: {
            assignmentId: input.assignmentId,
            criterionId: s.criterionId,
          },
        },
        create: {
          assignmentId: input.assignmentId,
          criterionId: s.criterionId,
          score: s.score,
          justification: s.justification.trim(),
        },
        update: {
          score: s.score,
          justification: s.justification.trim(),
        },
      });
    }

    // Upsert verdict
    const verdict = await tx.judgeVerdict.upsert({
      where: { assignmentId: input.assignmentId },
      create: {
        assignmentId: input.assignmentId,
        finalScore,
        feedbackText: input.feedbackText?.trim() || null,
      },
      update: {
        finalScore,
        feedbackText: input.feedbackText?.trim() || null,
        submittedAt: new Date(),
      },
    });

    // Recalculate and update overall ArenaSubmission score if multiple judges assigned
    const allAssignments = await tx.judgeAssignment.findMany({
      where: { submissionId: assignment.submissionId },
      include: { verdict: true },
    });

    const verdicts = allAssignments
      .map((a) => a.verdict)
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (verdicts.length > 0) {
      const avgScore = Number(
        (verdicts.reduce((acc, v) => acc + v.finalScore, 0) / verdicts.length).toFixed(2)
      );
      await tx.arenaSubmission.update({
        where: { id: assignment.submissionId },
        data: { finalScore: avgScore },
      });
    }

    return {
      success: true,
      verdictId: verdict.id,
      finalScore,
    };
  });
}

/**
 * Lists assigned submissions for a judge to review.
 */
export async function getJudgeAssignments(judgeUserId: string, arenaId?: string) {
  return prisma.judgeAssignment.findMany({
    where: {
      judge: {
        userId: judgeUserId,
        ...(arenaId ? { arenaId } : {}),
      },
    },
    include: {
      submission: {
        include: {
          entry: {
            include: {
              user: { select: { id: true, fullName: true, handle: true, avatarUrl: true } },
              team: { select: { id: true, name: true } },
            },
          },
        },
      },
      scores: true,
      verdict: true,
      judge: {
        include: {
          arena: {
            include: {
              rubrics: {
                where: { isImmutable: true },
                orderBy: { version: "desc" },
                take: 1,
                include: { criteria: true },
              },
            },
          },
        },
      },
    },
  });
}
