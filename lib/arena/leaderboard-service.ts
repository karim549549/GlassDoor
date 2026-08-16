import "server-only";
import prisma from "@/lib/server/prisma";
import type { RatingDomain } from "@prisma/client";

export interface LeaderboardStanding {
  submissionId: string;
  /**
   * Competition rank (1, 2, 2, 4): tied scores share a rank and the next rank
   * skips accordingly. Null for a submission that has no score yet, which is
   * listed last as unranked rather than given a fabricated position.
   */
  rank: number | null;
  /** Team name for a squad entry, the solo entrant's handle/name otherwise. */
  entrantName: string;
  isTeam: boolean;
  score: number | null;
  /** Slug of a live (non-revoked) proof packet, if one has been issued. */
  proofPacketSlug: string | null;
}

export interface ArenaLeaderboard {
  arenaId: string;
  /**
   * False until the host publishes results. The standings array is empty in
   * that case — a partial or provisional table is worse than an honest wait.
   */
  isPublished: boolean;
  resultsPublishedAt: Date | null;
  standings: LeaderboardStanding[];
}

/**
 * Final standings for an arena.
 *
 * RANK IS COMPUTED HERE, AT READ TIME, and is stored nowhere. A persisted rank
 * column goes stale the instant a score is corrected or an appeal succeeds, and
 * the classic symptom is a table with two third places and no second. Deriving
 * it from the ordered scores on every read makes that impossible.
 *
 * Returns null when the arena does not exist.
 */
export async function getArenaLeaderboard(arenaId: string): Promise<ArenaLeaderboard | null> {
  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    select: { id: true, resultsPublishedAt: true },
  });

  if (!arena) return null;

  if (!arena.resultsPublishedAt) {
    return {
      arenaId: arena.id,
      isPublished: false,
      resultsPublishedAt: null,
      standings: [],
    };
  }

  const submissions = await prisma.arenaSubmission.findMany({
    where: { arenaId: arena.id, withdrawnAt: null },
    select: {
      id: true,
      finalScore: true,
      entry: {
        select: {
          team: { select: { name: true } },
          user: { select: { fullName: true, handle: true } },
        },
      },
      proofPacket: { select: { slug: true, isRevoked: true } },
    },
    // Unscored submissions sort to the bottom instead of leading the table,
    // which is what a plain `desc` would do with NULLs in Postgres.
    orderBy: [{ finalScore: { sort: "desc", nulls: "last" } }, { submittedAt: "asc" }],
  });

  let previousScore: number | null = null;
  let previousRank = 0;

  const standings: LeaderboardStanding[] = submissions.map((s, index) => {
    let rank: number | null = null;
    if (s.finalScore !== null) {
      rank = s.finalScore === previousScore ? previousRank : index + 1;
      previousScore = s.finalScore;
      previousRank = rank;
    }

    const teamName = s.entry.team?.name?.trim();
    const soloName = s.entry.user?.fullName?.trim();
    const soloHandle = s.entry.user?.handle?.trim();

    return {
      submissionId: s.id,
      rank,
      entrantName: teamName || soloName || (soloHandle ? `@${soloHandle}` : "Unnamed entrant"),
      isTeam: Boolean(s.entry.team),
      score: s.finalScore,
      proofPacketSlug:
        s.proofPacket && !s.proofPacket.isRevoked ? s.proofPacket.slug : null,
    };
  });

  return {
    arenaId: arena.id,
    isPublished: true,
    resultsPublishedAt: arena.resultsPublishedAt,
    standings,
  };
}

/**
 * Global standings across every domain, for the board rail on the landing page.
 *
 * Reads RatingState, which is written only by a published judging run - so a
 * name can appear here exactly once someone has been judged, and never before.
 * There is deliberately no fallback to placeholder names: an invented
 * leaderboard is the single most damaging thing a credential platform can
 * publish, and this page carried one before (eight fictional winners on every
 * arena). Empty is the correct output until somebody competes.
 */
export interface GlobalStanding {
  userId: string;
  handle: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  domain: RatingDomain;
  rating: number;
  /** Glicko-2 deviation. High means the rating is not yet settled. */
  deviation: number;
}

export async function getGlobalStandings(limit = 12): Promise<GlobalStanding[]> {
  const rows = await prisma.ratingState.findMany({
    orderBy: { rating: "desc" },
    take: limit,
    select: {
      userId: true,
      domain: true,
      rating: true,
      deviation: true,
      user: { select: { handle: true, fullName: true, avatarUrl: true } },
    },
  });

  return rows.map((r) => ({
    userId: r.userId,
    handle: r.user?.handle ?? null,
    fullName: r.user?.fullName ?? null,
    avatarUrl: r.user?.avatarUrl ?? null,
    domain: r.domain,
    rating: Number(r.rating),
    deviation: Number(r.deviation),
  }));
}
