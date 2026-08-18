import "server-only";
import { Prisma, type ArenaFormat, type ArenaAuthority, type ArenaIntent, type RatingDomain, type DifficultyTier, type PrizeCurrency } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import { arenaStatusWhere } from "./status";
import type { ArenaFormOutput, ArenaListQuery } from "./schema";
import {
  ARENA_LIST_SELECT,
  ARENA_DETAIL_INCLUDE,
  type ArenaListItem,
  type ArenaDetail,
} from "./types";

export { ARENA_LIST_SELECT, ARENA_DETAIL_INCLUDE };

export interface ListArenasParams extends ArenaListQuery {
  userId?: string | null;
  now?: Date;
}

export interface ListArenasResult {
  arenas: ArenaListItem[];
  total: number;
  totalPages: number;
  myCount: number | null;
}

export interface ArenaDetailMeta {
  isOwner: boolean;
  isRegistered: boolean;
  totalParticipants: number;
  canAccessPrivate: boolean;
}

/** Matches an arena the user created, entered directly, or belongs to via a team. */
function myArenasWhere(userId: string): Prisma.ArenaWhereInput {
  return {
    OR: [
      { creatorId: userId },
      { entries: { some: { userId, withdrawnAt: null } } },
      { teams: { some: { members: { some: { userId } } } } },
    ],
  };
}

export async function listArenas(params: ListArenasParams): Promise<ListArenasResult> {
  const { page, limit, status, access, search, sortBy, tab, userId, tag, now = new Date() } = params;
  const skip = (page - 1) * limit;

  const statusFilter = arenaStatusWhere(status, now);

  const where: Prisma.ArenaWhereInput = {
    isDeleted: false,
    ...statusFilter,
  };

  if (tab === "my") {
    if (!userId) {
      throw new Error("listArenas: tab='my' requires a userId.");
    }
    const myCondition = myArenasWhere(userId);
    if (where.OR) {
      where.AND = [{ OR: where.OR }, myCondition];
      delete where.OR;
    } else {
      Object.assign(where, myCondition);
    }
  }

  if (access === "public") {
    where.isPrivate = false;
  } else if (access === "private") {
    where.isPrivate = true;
  }

  if (tag && tag.trim()) {
    where.tags = {
      some: {
        tag: {
          OR: [
            { slug: tag.toLowerCase() },
            { name: { equals: tag, mode: "insensitive" } },
          ],
        },
      },
    };
  }

  if (search.trim()) {
    const searchConditions: Prisma.ArenaWhereInput[] = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { rulesText: { contains: search, mode: "insensitive" } },
    ];

    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  let orderBy: Prisma.ArenaOrderByWithRelationInput = { createdAt: "desc" };
  if (sortBy === "oldest") {
    orderBy = { registrationStart: "asc" };
  } else if (sortBy === "title") {
    orderBy = { title: "asc" };
  } else if (sortBy === "teams") {
    orderBy = { teams: { _count: "desc" } };
  }

  const [arenas, total, myCount] = await Promise.all([
    prisma.arena.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: ARENA_LIST_SELECT,
    }),
    prisma.arena.count({ where }),
    userId
      ? prisma.arena.count({
          where: {
            isDeleted: false,
            ...myArenasWhere(userId),
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    arenas,
    total,
    totalPages: Math.ceil(total / limit),
    myCount,
  };
}

export async function getArenaDetail(
  uuid: string,
  currentUserId: string | null
): Promise<{ arena: ArenaDetail; meta: ArenaDetailMeta } | null> {
  const arena = await prisma.arena.findFirst({
    where: {
      id: uuid,
      isDeleted: false,
    },
    include: ARENA_DETAIL_INCLUDE,
  });

  if (!arena) {
    return null;
  }

  const isOwner = currentUserId ? arena.creatorId === currentUserId : false;
  const isDirectEntry = currentUserId
    ? arena.entries.some((entry) => entry.userId === currentUserId && !entry.withdrawnAt)
    : false;
  const isTeamEntry = currentUserId
    ? arena.teams.some((team) => team.members.some((member) => member.userId === currentUserId))
    : false;
  const isRegistered = isDirectEntry || isTeamEntry;

  const totalParticipants = arena.isTeam
    ? arena.teams.reduce((sum, team) => sum + team.members.length, 0)
    : arena.entries.filter((entry) => !entry.withdrawnAt).length;

  const canAccessPrivate = !arena.isPrivate || isOwner || isRegistered;

  return {
    arena,
    meta: {
      isOwner,
      isRegistered,
      totalParticipants,
      canAccessPrivate,
    },
  };
}

export type CreateArenaResult = { id: string } | { error: string };

export async function createArena(
  data: ArenaFormOutput & { creatorId: string }
): Promise<CreateArenaResult> {
  if (data.isPrivate && data.inviteCode) {
    const existing = await prisma.arena.findUnique({
      where: { inviteCode: data.inviteCode },
    });
    if (existing) {
      return { error: "This invitation code is already in use by another arena." };
    }
  }

  // Connect tags safely if provided
  let tagCreateInput: Prisma.TagOnArenaCreateNestedManyWithoutArenaInput | undefined;
  if (data.tags && data.tags.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: {
        OR: [
          { id: { in: data.tags } },
          { name: { in: data.tags } },
          { slug: { in: data.tags } },
        ],
      },
      select: { id: true },
    });

    if (existingTags.length > 0) {
      tagCreateInput = {
        create: existingTags.map((t) => ({
          tag: {
            connect: { id: t.id },
          },
        })),
      };
    }
  }

  const arena = await prisma.arena.create({
    data: {
      title: data.title,
      description: data.description,
      format: data.format as ArenaFormat,
      authority: data.authority as ArenaAuthority,
      intent: data.intent as ArenaIntent,
      domain: data.domain as RatingDomain,
      difficulty: data.difficulty as DifficultyTier,
      publishedAt: new Date(),
      locationType: data.locationType,
      locationName: data.locationType === "IN_PERSON" ? data.locationName || null : null,
      googleMapsUrl: data.locationType === "IN_PERSON" ? data.googleMapsUrl || null : null,
      isPrivate: data.isPrivate,
      inviteCode: data.isPrivate ? data.inviteCode || null : null,
      hasPrizePool: data.hasPrizePool,
      totalPrizePool: data.totalPrizePool || null,
      prizeCurrency: data.prizeCurrency as PrizeCurrency,
      firstPlacePrize: data.firstPlacePrize || null,
      secondPlacePrize: data.secondPlacePrize || null,
      thirdPlacePrize: data.thirdPlacePrize || null,
      prizeDisbursementTerms: data.prizeDisbursementTerms || null,
      requireHiringConsent: data.requireHiringConsent,
      companyId: data.companyId || null,
      registrationStart: new Date(data.registrationStart),
      registrationEnd: new Date(data.registrationEnd),
      ideaPhaseStart: new Date(data.ideaPhaseStart),
      ideaPhaseEnd: new Date(data.ideaPhaseEnd),
      implPhaseStart: new Date(data.implPhaseStart),
      implPhaseEnd: new Date(data.implPhaseEnd),
      isTeam: data.isTeam,
      minTeamSize: data.isTeam ? data.minTeamSize : 1,
      maxTeamSize: data.isTeam ? data.maxTeamSize : 1,
      maxParticipants: data.maxParticipants || null,
      allowLeaderAccessControl: data.isTeam ? data.allowLeaderAccessControl ?? true : null,
      requireGithubUrl: data.requireGithubUrl,
      requireFigmaUrl: data.requireFigmaUrl,
      requireVideoUrl: data.requireVideoUrl,
      requireWriteup: data.requireWriteup,
      rulesText: data.rulesText || "",
      creatorId: data.creatorId,
      tags: tagCreateInput,
    },
  });

  return { id: arena.id };
}

/** Fetches all available tags with total count of associated arenas. */
export async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      category: true,
      description: true,
      _count: {
        select: { arenas: true },
      },
    },
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    color: t.color || "golden",
    category: t.category || "General",
    description: t.description || "",
    count: t._count.arenas,
  }));
}

/**
 * Hook for RAG & AI Tag Extraction.
 */
export async function extractAndSuggestTags(title: string, description: string) {
  const allTags = await getAllTags();
  const textContent = `${title} ${description}`.toLowerCase();

  return allTags.filter((tag) =>
    textContent.includes(tag.name.toLowerCase()) || textContent.includes(tag.slug.toLowerCase())
  );
}

/**
 * Aggregate counts for the board summary on the landing page.
 *
 * Section 2 previously showed three hardcoded capability tags - one of which
 * ("XP RANKINGS SYSTEM") described a mechanic this platform does not have; the
 * rating is Glicko-2, not XP. These are counted from the same rows the board
 * itself lists, so the strip cannot drift from what a visitor sees when they
 * click through.
 *
 * Deliberately narrow. Prize pools, rating domains, formats and tags were all
 * considered and all rejected: no arena currently sets a prize, every arena
 * shares one domain and one format, and no published arena has a tag attached,
 * so each would render as a zero or a meaningless "1". A statistic that always
 * reads zero is worse than no statistic.
 */
export interface BoardSummary {
  /** Public, published, not deleted. */
  total: number;
  openNow: number;
  teamCount: number;
  soloCount: number;
  nextDeadline: Date | null;
}

export async function getBoardSummary(now: Date = new Date()): Promise<BoardSummary> {
  const visible: Prisma.ArenaWhereInput = {
    isDeleted: false,
    isPrivate: false,
    publishedAt: { not: null },
    canceledAt: null,
  };

  const openWhere: Prisma.ArenaWhereInput = {
    ...visible,
    registrationStart: { lte: now },
    registrationEnd: { gt: now },
  };

  const [total, openNow, teamCount, soloCount, next] = await Promise.all([
    prisma.arena.count({ where: visible }),
    prisma.arena.count({ where: openWhere }),
    prisma.arena.count({ where: { ...visible, isTeam: true } }),
    prisma.arena.count({ where: { ...visible, isTeam: false } }),
    prisma.arena.findFirst({
      where: { ...visible, registrationEnd: { gt: now } },
      orderBy: { registrationEnd: "asc" },
      select: { registrationEnd: true },
    }),
  ]);

  return { total, openNow, teamCount, soloCount, nextDeadline: next?.registrationEnd ?? null };
}
