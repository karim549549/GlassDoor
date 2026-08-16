import "server-only";
import prisma from "@/lib/server/prisma";
import { checkDbIntegrity } from "@/lib/server/db-integrity";
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
  // The conflict-of-interest trigger on judge_assignments is what stops a judge
  // scoring their own team, and Prisma does not model triggers - a `db push`, a
  // schema reset or a restore from a logical dump drops it silently and the app
  // keeps serving with the protection gone.
  //
  // lib/server/db-integrity.ts was written to catch exactly that and had no
  // call site anywhere in the repo, so the check never ran. Its own doc names
  // judge-assignment creation as the intended caller, but no code path creates
  // an assignment yet; recording a verdict is the live write whose validity
  // depends on that trigger having held, so it is checked here until the
  // assignment path exists.
  const integrity = await checkDbIntegrity();
  if (!integrity.ok) {
    // checkDbIntegrity already logged which trigger is missing and how to
    // restore it. Refuse rather than record a score that may have come from a
    // judge with an undetected conflict - a bad verdict taints every proof
    // packet in the arena, and a packet is the product.
    return {
      error:
        "Scoring is temporarily disabled: a required database safeguard is missing. This has been logged for the operators.",
    };
  }

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
