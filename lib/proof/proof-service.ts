import "server-only";
import crypto from "crypto";
import prisma from "@/lib/server/prisma";
import { contentHash, verifyContentHash } from "./hash";

export interface ProofPacketSnapshot {
  version: "1.0";
  submissionId: string;
  arena: {
    id: string;
    title: string;
    domain: string;
    difficulty: string;
    authority: string;
    format: string;
  };
  entrant: {
    isTeam: boolean;
    teamName: string | null;
    members: Array<{
      id: string;
      fullName: string | null;
      handle: string | null;
    }>;
  };
  deliverables: {
    githubUrl: string;
    figmaUrl: string | null;
    videoUrl: string | null;
    writeupText: string;
  };
  evaluation: {
    finalScore: number | null;
    verdicts: Array<{
      judgeId: string;
      finalScore: number;
      feedbackText: string | null;
      scores: Array<{
        criterionTitle: string;
        criterionWeight: number;
        score: number;
        justification: string;
      }>;
    }>;
  };
  commits: Array<{
    sha: string;
    message: string | null;
    committedAt: string;
  }>;
  issuedAt: string;
}

function generateRandomSlug(length = 12): string {
  const chars = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Creates an immutable, tamper-evident Proof Packet credential for a scored submission.
 */
export async function generateProofPacket(submissionId: string) {
  const existing = await prisma.proofPacket.findUnique({
    where: { submissionId },
  });
  if (existing) {
    return existing;
  }

  const sub = await prisma.arenaSubmission.findUnique({
    where: { id: submissionId },
    include: {
      arena: true,
      entry: {
        include: {
          user: { select: { id: true, fullName: true, handle: true } },
          team: {
            include: {
              members: {
                include: {
                  user: { select: { id: true, fullName: true, handle: true } },
                },
              },
            },
          },
        },
      },
      assignments: {
        include: {
          verdict: true,
          scores: {
            include: { criterion: true },
          },
        },
      },
      commits: { orderBy: { committedAt: "asc" } },
    },
  });

  if (!sub) {
    throw new Error("Submission not found.");
  }

  const members = sub.entry.user
    ? [sub.entry.user]
    : sub.entry.team?.members.map((m) => m.user) || [];

  const issuedAt = new Date().toISOString();

  const snapshot: ProofPacketSnapshot = {
    version: "1.0",
    submissionId: sub.id,
    arena: {
      id: sub.arena.id,
      title: sub.arena.title,
      domain: sub.arena.domain,
      difficulty: sub.arena.difficulty,
      authority: sub.arena.authority,
      format: sub.arena.format,
    },
    entrant: {
      isTeam: !!sub.entry.team,
      teamName: sub.entry.team?.name || null,
      members,
    },
    deliverables: {
      githubUrl: sub.githubUrl,
      figmaUrl: sub.figmaUrl,
      videoUrl: sub.videoUrl,
      writeupText: sub.writeupText,
    },
    evaluation: {
      finalScore: sub.finalScore,
      verdicts: sub.assignments
        .filter((a) => a.verdict !== null)
        .map((a) => ({
          judgeId: a.judgeId,
          finalScore: a.verdict!.finalScore,
          feedbackText: a.verdict!.feedbackText,
          scores: a.scores.map((s) => ({
            criterionTitle: s.criterion.title,
            criterionWeight: s.criterion.weight,
            score: s.score,
            justification: s.justification,
          })),
        })),
    },
    commits: sub.commits.map((c) => ({
      sha: c.sha,
      message: c.message,
      committedAt: c.committedAt.toISOString(),
    })),
    issuedAt,
  };

  const hash = contentHash(snapshot);
  const slug = generateRandomSlug(12);

  return await prisma.proofPacket.create({
    data: {
      slug,
      submissionId: sub.id,
      contentHash: hash,
      payloadSnapshot: snapshot as any,
      issuedAt: new Date(issuedAt),
    },
  });
}

/**
 * Loads a Proof Packet by its public slug and performs cryptographic verification.
 */
export async function getProofPacketBySlug(slug: string) {
  const packet = await prisma.proofPacket.findUnique({
    where: { slug },
    include: {
      submission: {
        include: {
          arena: true,
        },
      },
    },
  });

  if (!packet) return null;

  const isCryptographicallyValid = verifyContentHash(
    packet.payloadSnapshot,
    packet.contentHash
  );

  return {
    ...packet,
    snapshot: packet.payloadSnapshot as unknown as ProofPacketSnapshot,
    isCryptographicallyValid,
  };
}
