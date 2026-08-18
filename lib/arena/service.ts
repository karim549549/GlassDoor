import "server-only";
import { Prisma, type ArenaAuthority, type DifficultyTier, type PrizeCurrency } from "@prisma/client";
import { mayHavePrizePool, type ArenaAuthorityValue } from "./authority";
import prisma from "@/lib/server/prisma";
import { arenaStatusWhere } from "./status";
import type { ArenaFormOutput, ArenaListQuery, ArenaSortOption } from "./schema";
import {
  ARENA_LIST_SELECT,
  arenaListSelect,
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
  const {
    page, limit, status, place, entry, difficulty, prized,
    search, sortBy, tab, userId, now = new Date(),
  } = params;
  const skip = (page - 1) * limit;

  const statusFilter = arenaStatusWhere(status, now);

  /**
   * Conditions are collected and ANDed rather than merged onto one object.
   *
   * Several of them carry their own `OR` - the "my arenas" clause, the search
   * clause, the private-visibility clause below - and the previous code merged
   * them by hand, deleting `where.OR` and reassigning it. That worked for two
   * and silently dropped the third: whichever OR was written last won, so
   * enabling search on the "my" tab searched the whole board. An array cannot
   * have that bug.
   */
  const conditions: Prisma.ArenaWhereInput[] = [];

  const where: Prisma.ArenaWhereInput = {
    isDeleted: false,
    ...statusFilter,
  };

  /**
   * Private arenas do not appear on a public board.
   *
   * They were listed to everyone: 21 of the 106 arenas in the database are
   * private, all of them published, all of them on the board - each with an
   * "Invite only" badge announcing itself. app/sitemap.ts already refuses to
   * emit them, on the grounds that "a private arena is reachable only through
   * its invite code, so listing one here would publish that existence to every
   * crawler". That reasoning applies at least as strongly to the page a crawler
   * actually reads, which this one is: /arena is server-rendered and indexed.
   *
   * A signed-in reader still sees the private arenas they host or have entered,
   * which is what makes the "Mine" tab work.
   */
  conditions.push(
    userId ? { OR: [{ isPrivate: false }, myArenasWhere(userId)] } : { isPrivate: false }
  );

  if (tab === "my") {
    if (!userId) {
      throw new Error("listArenas: tab='my' requires a userId.");
    }
    conditions.push(myArenasWhere(userId));
  } else if (status === "all") {
    /**
     * The public board lists what you can still take part in.
     *
     * Without this, "all" on the public tab means 81 finished arenas and four
     * live ones - a board that is 95% history, where the four rows anyone came
     * for are below the fold. History is still reachable: it is what the "Mine"
     * tab shows in full, and a finished arena keeps its own page and its own
     * URL. It is simply not what a board is for.
     */
    conditions.push({ implPhaseEnd: { gt: now } });
  }

  // The four axes a reader actually decides on. `access` used to be here
  // instead - a filter *for* arenas you cannot join - and domain and difficulty
  // could not be filtered at all, despite being the fields that decide which
  // ladder a result counts on and what it is worth.
  if (place === "online") {
    where.locationType = "ONLINE";
  } else if (place === "in_person") {
    // `LocationType` is ONLINE | IN_PERSON. There is no HYBRID, despite PRD 2
    // and several component props implying one.
    where.locationType = "IN_PERSON";
  }

  if (entry === "solo") {
    where.isTeam = false;
  } else if (entry === "team") {
    where.isTeam = true;
  }

  if (difficulty) where.difficulty = difficulty;
  if (prized) where.hasPrizePool = true;

  if (search.trim()) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { rulesText: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  where.AND = conditions;

  // Default is "closing", not "newest". The board's job is "what can I enter",
  // and sorting by creation date put arenas that closed weeks ago at the top of
  // it. Ascending registrationEnd puts the one shutting next first.
  //
  // Exhaustive over ArenaSortOption via the record, so adding an option without
  // an ordering is a type error rather than a silent fall-through to newest.
  /**
   * "Closing soonest" has to know what it is sorting.
   *
   * Ascending `registrationEnd` is right for a list of open arenas - the one
   * shutting next comes first. On a mixed list it is exactly backwards: 102 of
   * the 106 arenas here have already finished, so ascending order led the board
   * with three arenas that closed two months ago. That shipped.
   *
   * Among arenas that have already closed, the meaningful order is the reverse:
   * most recently finished first, because that is the history anyone wants -
   * what happened last weekend, not what happened first. Prisma cannot express
   * "future ascending, past descending" in one `orderBy`, and it does not need
   * to: the direction follows the filter.
   */
  const closingDirection: Prisma.SortOrder = status === "open" ? "asc" : "desc";

  const ORDER_BY: Record<ArenaSortOption, Prisma.ArenaOrderByWithRelationInput> = {
    closing: { registrationEnd: closingDirection },
    newest: { createdAt: "desc" },
    prize: { totalPrizePool: { sort: "desc", nulls: "last" } },
    entrants: { entries: { _count: "desc" } },
    title: { title: "asc" },
  };
  const orderBy = ORDER_BY[sortBy];

  const [arenas, total, myCount] = await Promise.all([
    prisma.arena.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: arenaListSelect(userId ?? null),
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

/**
 * `authority` and `companyId` arrive as arguments, never inside `data`.
 *
 * They used to be read straight off the validated request body, which made the
 * whole authority matrix self-assignable - a caller could ask for OFFICIAL and
 * receive the tier PRD 7.1 reserves for platform admins, complete with full XP
 * and prize eligibility. The caller resolves them through
 * `resolveArenaAuthority` and hands the result in. Keeping them out of the
 * payload type is the part that matters: a future edit cannot reintroduce the
 * hole by forwarding one more field from the body.
 */
export async function createArena(
  data: ArenaFormOutput & {
    creatorId: string;
    authority: ArenaAuthorityValue;
    companyId: string | null;
  }
): Promise<CreateArenaResult> {
  if (data.isPrivate && data.inviteCode) {
    const existing = await prisma.arena.findUnique({
      where: { inviteCode: data.inviteCode },
    });
    if (existing) {
      return { error: "This invitation code is already in use by another arena." };
    }
  }

  const prizesAllowed = mayHavePrizePool(data.authority);

  const arena = await prisma.arena.create({
    data: {
      title: data.title,
      description: data.description,
      authority: data.authority as ArenaAuthority,
      difficulty: data.difficulty as DifficultyTier,
      publishedAt: new Date(),
      locationType: data.locationType,
      locationName: data.locationType === "IN_PERSON" ? data.locationName || null : null,
      googleMapsUrl: data.locationType === "IN_PERSON" ? data.googleMapsUrl || null : null,
      isPrivate: data.isPrivate,
      inviteCode: data.isPrivate ? data.inviteCode || null : null,
      // PRD 7.1 blocks cash prizes on COMMUNITY arenas in V1. The create form
      // does not offer them, but this route accepted the fields regardless, so
      // the block existed only in the document. Enforced at the write.
      hasPrizePool: prizesAllowed && data.hasPrizePool,
      totalPrizePool: prizesAllowed ? data.totalPrizePool || null : null,
      prizeCurrency: data.prizeCurrency as PrizeCurrency,
      firstPlacePrize: prizesAllowed ? data.firstPlacePrize || null : null,
      secondPlacePrize: prizesAllowed ? data.secondPlacePrize || null : null,
      thirdPlacePrize: prizesAllowed ? data.thirdPlacePrize || null : null,
      prizeDisbursementTerms: prizesAllowed ? data.prizeDisbursementTerms || null : null,
      requireHiringConsent: data.requireHiringConsent,
      companyId: data.companyId,
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
    },
  });

  return { id: arena.id };
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

export interface SpotlightArena {
  id: string;
  title: string;
  /** The moment this arena's current phase turns over. */
  at: Date;
  entered: number;
}

export interface BoardSpotlight {
  closingSoon: SpotlightArena[];
  runningNow: SpotlightArena[];
  justFinished: SpotlightArena[];
}

/**
 * Three short lists for the board's rail.
 *
 * The rail exists for two reasons at once. The obvious one is content - the
 * page was a filter bar and a column of rows, and read thin. The less obvious
 * one is that it fixes the rows: on a full-width container the middle column
 * stretched, so a short title left a long empty gap before the countdown on the
 * right. Narrowing the list to make room for the rail closes that gap without
 * inventing anything to put in it.
 *
 * `take: 3` and a four-field select each, so the whole rail costs less than one
 * row of the old list query did.
 */
export async function getBoardSpotlight(now: Date = new Date()): Promise<BoardSpotlight> {
  const visible: Prisma.ArenaWhereInput = {
    isDeleted: false,
    isPrivate: false,
    publishedAt: { not: null },
    canceledAt: null,
  };

  const select = {
    id: true,
    title: true,
    registrationEnd: true,
    implPhaseEnd: true,
    _count: { select: { entries: true } },
  } satisfies Prisma.ArenaSelect;

  const [closing, running, finished] = await Promise.all([
    prisma.arena.findMany({
      where: { ...visible, registrationStart: { lte: now }, registrationEnd: { gt: now } },
      orderBy: { registrationEnd: "asc" },
      take: 3,
      select,
    }),
    prisma.arena.findMany({
      where: { ...visible, registrationEnd: { lte: now }, implPhaseEnd: { gt: now } },
      orderBy: { implPhaseEnd: "asc" },
      take: 3,
      select,
    }),
    prisma.arena.findMany({
      where: { ...visible, implPhaseEnd: { lte: now } },
      orderBy: { implPhaseEnd: "desc" },
      take: 4,
      select,
    }),
  ]);

  const shape = (rows: typeof closing, field: "registrationEnd" | "implPhaseEnd") =>
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      at: r[field],
      entered: r._count.entries,
    }));

  return {
    closingSoon: shape(closing, "registrationEnd"),
    runningNow: shape(running, "implPhaseEnd"),
    justFinished: shape(finished, "implPhaseEnd"),
  };
}

export interface BoardFacets {
  open: number;
  live: number;
  finished: number;
  total: number;
  /** Only domains that actually have arenas, biggest first. */
  domains: { domain: string; count: number }[];
  /** When the next registration closes, for the urgency line. */
  nextDeadline: Date | null;
}

/**
 * The numbers that make the board a board rather than a list.
 *
 * Every one is a `count` or a `groupBy` - Postgres answers them with
 * aggregates, no rows crossing the wire - and every one is also navigation: the
 * status counts label the rail, and the domain counts are the quick filters.
 * `getBoardSummary` above returns four numbers for the homepage and cannot
 * answer either question.
 *
 * Deliberately unfiltered: these describe the whole public board, not the
 * current query. A facet count that moved with the filters would tell a reader
 * "0 in AI" the moment they picked a difficulty, which is the opposite of what
 * a facet is for.
 */
export async function getBoardFacets(now: Date = new Date()): Promise<BoardFacets> {
  const visible: Prisma.ArenaWhereInput = {
    isDeleted: false,
    isPrivate: false,
    publishedAt: { not: null },
    canceledAt: null,
  };

  const [total, open, live, finished, byDomain, next] = await Promise.all([
    prisma.arena.count({ where: visible }),
    prisma.arena.count({
      where: { ...visible, registrationStart: { lte: now }, registrationEnd: { gt: now } },
    }),
    prisma.arena.count({
      where: { ...visible, registrationEnd: { lte: now }, implPhaseEnd: { gt: now } },
    }),
    prisma.arena.count({ where: { ...visible, implPhaseEnd: { lte: now } } }),
    prisma.arena.groupBy({
      by: ["domain"],
      where: visible,
      _count: { _all: true },
    }),
    prisma.arena.findFirst({
      where: { ...visible, registrationEnd: { gt: now } },
      orderBy: { registrationEnd: "asc" },
      select: { registrationEnd: true },
    }),
  ]);

  return {
    total,
    open,
    live,
    finished,
    domains: byDomain
      .map((row) => ({ domain: row.domain as string, count: row._count._all }))
      .sort((a, b) => b.count - a.count),
    nextDeadline: next?.registrationEnd ?? null,
  };
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
