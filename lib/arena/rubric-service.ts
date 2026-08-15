import "server-only";
import prisma from "@/lib/server/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Rubric authoring.
 *
 * Two things this module exists to guarantee.
 *
 * 1. A rubric can be created at all. There was previously no service, route or
 *    seed that produced one, so the judging console rendered criteria from a
 *    rubric nothing could create and the pipeline could not run end to end.
 *
 * 2. The three anti-AI signals are actually SCORED. Commit history, the oral
 *    defense and mid-arena requirement changes were all being *collected* and
 *    none were being *counted* - no criterion referenced them, so a judge could
 *    publish a verdict without ever opening the defense recording. Those three
 *    criteria are now prepended to every rubric and cannot be removed. Since
 *    `JudgeScore.justification` is NOT NULL, a judge must write a sentence
 *    about each one; that is the enforcement.
 */

/** Titles are matched against, so treat them as identifiers, not copy. */
export const SIGNAL_CRITERION_TITLES = {
  process: "Process — development history",
  defense: "Defense — understanding of own work",
  adaptation: "Adaptation — response to changed requirements",
} as const;

export interface CriterionInput {
  title: string;
  description: string;
  weight?: number;
  maxScore?: number;
}

/**
 * The W-1 signals, in scoring order. Weighted at 1.0 each so they carry real
 * influence without dominating a rubric whose domain criteria are the point.
 *
 * Each description tells the judge what evidence to look at and, crucially,
 * what a LOW score looks like - "no rubric guidance" is how open judging decays
 * into vibes, which is exactly what this platform sells against.
 */
export const W1_SIGNAL_CRITERIA: readonly CriterionInput[] = [
  {
    title: SIGNAL_CRITERION_TITLES.process,
    description:
      "Review the synced commit timeline, not just the final repository. Does the work show " +
      "incremental development - dead ends, refactors, a plausible span - or does it arrive as " +
      "one or two large commits with no history? Score low for a single bulk commit; score high " +
      "for a timeline whose shape matches the problem being solved. Note: commit timestamps are " +
      "client-controlled and therefore weak evidence on their own - weigh them alongside the " +
      "defense rather than treating a long span as proof.",
    weight: 1.0,
    maxScore: 10,
  },
  {
    title: SIGNAL_CRITERION_TITLES.defense,
    description:
      "Watch the recorded defense. The entrant is answering questions generated from their own " +
      "diff. Do they explain WHY they made specific decisions, or only describe what the code " +
      "does? Score low if they cannot account for their own choices, or if no defense was " +
      "recorded at all. This is the highest-signal check available: a person cannot explain " +
      "reasoning they never had.",
    weight: 1.0,
    maxScore: 10,
  },
  {
    title: SIGNAL_CRITERION_TITLES.adaptation,
    description:
      "Check the requirements that were released mid-arena and how the submission responded. " +
      "Code that was generated without comprehension tends to break when the specification " +
      "moves; understood code bends. Score low where a released requirement was ignored or " +
      "bolted on without touching the surrounding design. If no requirement was injected in " +
      "this arena, score this neutral and say so in the justification.",
    weight: 1.0,
    maxScore: 10,
  },
];

export type CreateRubricResult =
  | { rubric: Prisma.RubricGetPayload<{ include: { criteria: true } }> }
  | { error: string };

/**
 * Creates the next rubric version for an arena.
 *
 * Versions are append-only: publishing freezes a version (`isImmutable`) and
 * any change produces a new one. A "published rubric" that can be edited after
 * submissions open defeats the entire premise entrants are judged under.
 */
export async function createRubric(
  arenaId: string,
  criteria: CriterionInput[],
  options: { publish?: boolean } = {}
): Promise<CreateRubricResult> {
  const custom = criteria.filter(
    (c) => !Object.values(SIGNAL_CRITERION_TITLES).includes(c.title as never)
  );

  if (custom.length === 0) {
    return { error: "A rubric needs at least one domain-specific criterion beyond the standard signals." };
  }

  const invalid = custom.find(
    (c) => !c.title?.trim() || !c.description?.trim() || (c.maxScore ?? 10) <= 0
  );
  if (invalid) {
    return { error: `Criterion "${invalid.title || "(untitled)"}" needs a title, a description and a positive maximum score.` };
  }

  const latest = await prisma.rubric.findFirst({
    where: { arenaId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  // The signals always lead, so a judge scores them before forming an overall
  // impression from the domain criteria.
  const all = [...W1_SIGNAL_CRITERIA, ...custom];

  const rubric = await prisma.rubric.create({
    data: {
      arenaId,
      version: (latest?.version ?? 0) + 1,
      isImmutable: options.publish ?? false,
      criteria: {
        create: all.map((c) => ({
          title: c.title,
          description: c.description,
          weight: c.weight ?? 1.0,
          maxScore: c.maxScore ?? 10,
        })),
      },
    },
    include: { criteria: true },
  });

  return { rubric };
}

/**
 * Freezes a rubric. Irreversible by design - unfreezing would let a host move
 * the goalposts after seeing submissions.
 */
export async function publishRubric(rubricId: string): Promise<{ ok: true } | { error: string }> {
  const rubric = await prisma.rubric.findUnique({
    where: { id: rubricId },
    select: { isImmutable: true, criteria: { select: { id: true } } },
  });

  if (!rubric) return { error: "Rubric not found." };
  if (rubric.isImmutable) return { error: "This rubric version is already published and cannot be changed." };
  if (rubric.criteria.length === 0) return { error: "Cannot publish a rubric with no criteria." };

  await prisma.rubric.update({ where: { id: rubricId }, data: { isImmutable: true } });
  return { ok: true };
}

/** The published rubric a judge scores against, or null if none is frozen yet. */
export async function getPublishedRubric(arenaId: string) {
  return prisma.rubric.findFirst({
    where: { arenaId, isImmutable: true },
    orderBy: { version: "desc" },
    include: { criteria: { orderBy: { createdAt: "asc" } } },
  });
}
