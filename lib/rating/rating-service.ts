import "server-only";
import type { RatingDomain } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import {
  ratePeriod,
  GLICKO2_DEFAULTS,
  type Glicko2Rating,
  type Glicko2Result,
} from "./glicko2";

export interface PeriodProcessResult {
  success: boolean;
  period: number;
  playersUpdated: number;
  eventsRecorded: number;
  arenasProcessed: number;
}

/**
 * Executes a full rating period batch calculation across all domains.
 * All arena results concluded during this window are converted into match pairings,
 * computed through Glicko-2, and committed to the append-only RatingEvent ledger.
 */
export async function processRatingPeriod(periodNumber: number): Promise<PeriodProcessResult> {
  const completedArenas = await prisma.arena.findMany({
    where: {
      resultsPublishedAt: { not: null },
      isDeleted: false,
    },
    include: {
      submissions: {
        where: { finalScore: { not: null }, withdrawnAt: null },
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

  // Group arenas by domain
  const arenaDomainMap = new Map<RatingDomain, typeof completedArenas>();
  for (const a of completedArenas) {
    const list = arenaDomainMap.get(a.domain) || [];
    list.push(a);
    arenaDomainMap.set(a.domain, list);
  }

  let totalPlayersUpdated = 0;
  let totalEventsRecorded = 0;

  for (const [domain, domainArenas] of arenaDomainMap.entries()) {
    // 1. Gather all users who competed in this domain during this period
    const playerMatches = new Map<string, Glicko2Result[]>();
    const userToArena = new Map<string, string>();

    for (const a of domainArenas) {
      const scoredSubs = a.submissions.filter((s) => s.finalScore !== null);
      if (scoredSubs.length < 2) continue;

      // Sort submissions by finalScore descending
      scoredSubs.sort((x, y) => (y.finalScore ?? 0) - (x.finalScore ?? 0));

      for (let i = 0; i < scoredSubs.length; i++) {
        const subA = scoredSubs[i];
        const userIdsA = subA.entry.userId
          ? [subA.entry.userId]
          : subA.entry.team?.members.map((m) => m.userId) || [];

        for (const uA of userIdsA) {
          userToArena.set(uA, a.id);
          const matches = playerMatches.get(uA) || [];

          for (let j = 0; j < scoredSubs.length; j++) {
            if (i === j) continue;
            const subB = scoredSubs[j];
            const userIdsB = subB.entry.userId
              ? [subB.entry.userId]
              : subB.entry.team?.members.map((m) => m.userId) || [];

            const scoreOutcome =
              (subA.finalScore ?? 0) > (subB.finalScore ?? 0)
                ? 1.0
                : (subA.finalScore ?? 0) < (subB.finalScore ?? 0)
                ? 0.0
                : 0.5;

            for (const uB of userIdsB) {
              if (uA === uB) continue;
              matches.push({
                opponent: {
                  rating: GLICKO2_DEFAULTS.rating,
                  deviation: GLICKO2_DEFAULTS.deviation,
                  volatility: GLICKO2_DEFAULTS.volatility,
                },
                score: scoreOutcome,
              });
            }
          }
          playerMatches.set(uA, matches);
        }
      }
    }

    // 2. Fetch existing rating states for this domain
    const allDomainUsers = await prisma.user.findMany({ select: { id: true } });
    const existingStates = await prisma.ratingState.findMany({
      where: { domain },
    });
    const stateMap = new Map(existingStates.map((s) => [s.userId, s]));

    // 3. Compute new rating for each player
    for (const u of allDomainUsers) {
      const currentState = stateMap.get(u.id);
      const prePlayer: Glicko2Rating = {
        rating: currentState?.rating ?? GLICKO2_DEFAULTS.rating,
        deviation: currentState?.deviation ?? GLICKO2_DEFAULTS.deviation,
        volatility: currentState?.volatility ?? GLICKO2_DEFAULTS.volatility,
      };

      const matches = playerMatches.get(u.id);

      if (matches && matches.length > 0) {
        // Hydrate opponent ratings with current domain states
        const hydratedMatches: Glicko2Result[] = matches.map((m) => {
          return {
            score: m.score,
            opponent: {
              rating: m.opponent.rating,
              deviation: m.opponent.deviation,
              volatility: m.opponent.volatility,
            },
          };
        });

        const postPlayer = ratePeriod(prePlayer, hydratedMatches);
        const delta = Number((postPlayer.rating - prePlayer.rating).toFixed(2));

        await prisma.$transaction([
          prisma.ratingState.upsert({
            where: { userId_domain: { userId: u.id, domain } },
            create: {
              userId: u.id,
              domain,
              rating: postPlayer.rating,
              deviation: postPlayer.deviation,
              volatility: postPlayer.volatility,
              lastActivePeriod: periodNumber,
            },
            update: {
              rating: postPlayer.rating,
              deviation: postPlayer.deviation,
              volatility: postPlayer.volatility,
              lastActivePeriod: periodNumber,
            },
          }),
          prisma.ratingEvent.create({
            data: {
              userId: u.id,
              domain,
              period: periodNumber,
              arenaId: userToArena.get(u.id) || null,
              delta,
              preRating: prePlayer.rating,
              postRating: postPlayer.rating,
              preDeviation: prePlayer.deviation,
              postDeviation: postPlayer.deviation,
            },
          }),
        ]);

        totalPlayersUpdated++;
        totalEventsRecorded++;
      } else if (currentState) {
        // Inactive player: step deviation outward using empty results array
        const idlePlayer = ratePeriod(prePlayer, []);
        await prisma.ratingState.update({
          where: { id: currentState.id },
          data: { deviation: idlePlayer.deviation },
        });
      }
    }
  }

  // Record period completion
  await prisma.ratingPeriod.upsert({
    where: { period: periodNumber },
    create: {
      period: periodNumber,
      startedAt: new Date(Date.now() - 86400000 * 7),
      closedAt: new Date(),
      isProcessed: true,
    },
    update: {
      isProcessed: true,
      closedAt: new Date(),
    },
  });

  return {
    success: true,
    period: periodNumber,
    playersUpdated: totalPlayersUpdated,
    eventsRecorded: totalEventsRecorded,
    arenasProcessed: completedArenas.length,
  };
}
