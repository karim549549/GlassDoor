import "server-only";
import { cache } from "react";
import { Prisma, type ArenaAuthority, type DifficultyTier, type PrizeCurrency } from "@prisma/client";
import { mayHavePrizePool, type ArenaAuthorityValue } from "./authority";
import prisma from "@/lib/server/prisma";
import { arenaStatusWhere } from "./status";
import { checkScheduleEdit } from "./edit-rules";
import { arenaSlugBase, uniqueArenaSlug, type ArenaRef } from "@/lib/arena-slug";
import type { ArenaFormOutput, ArenaListQuery, ArenaSortOption } from "./schema";
import {
  ARENA_LIST_SELECT,
  arenaListSelect,
  ARENA_DETAIL_SELECT,
  type ArenaListItem,
  type ArenaDetailRow,
} from "./types";

export { ARENA_LIST_SELECT, ARENA_DETAIL_SELECT };

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
  /**
   * The team the viewer is on, if any. Comes free with the entry probe, and
   * is what lets the lobby say "you are here" instead of offering a seat on a
   * team the reader is already sitting in.
   */
  viewerTeamId: string | null;
  /**
   * Always true when a row is returned at all - `getArenaDetail` refuses
   * rather than reporting. Retained so a caller that still checks it keeps
   * working; new code should not read it.
   */
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

  /**
   * Sets, not single values. An empty set is no restriction, and a full set is
   * the same thing - which is why there is no "all" option any more: it was a
   * third value meaning the absence of the other two.
   *
   * A set with every member still becomes an `in` clause rather than being
   * skipped. Postgres answers it identically and the query then says what the
   * reader picked.
   */
  if (place.length > 0) {
    // `LocationType` is ONLINE | IN_PERSON. There is no HYBRID, despite PRD 2
    // and several component props implying one.
    where.locationType = { in: place.map((p) => (p === "online" ? "ONLINE" : "IN_PERSON")) };
  }

  if (entry.length === 1) {
    where.isTeam = entry[0] === "team";
  }

  if (difficulty.length > 0) where.difficulty = { in: difficulty };
  if (prized) where.hasPrizePool = true;

  if (search.trim()) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        // Rules are deliberately not searched. They are boilerplate - every
        // arena says "original work only" - so matching them returned the
        // whole board for words nobody meant as a query.
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

/**
 * The arena row, deduplicated across one request.
 *
 * `generateMetadata` and the page body both need it, and they ask with
 * different viewers - null for metadata, the reader's id for the page - so a
 * `cache()` around `getArenaDetail` deduplicated nothing for anyone signed
 * in: every arena page ran the detail query twice.
 *
 * Cached here instead, on the part that does not depend on the viewer. Keyed
 * on two strings rather than the `ArenaRef` object because React's `cache`
 * compares arguments by identity, and two calls building their own `{ kind,
 * id }` would miss every time.
 */
const loadArenaRow = cache(async (kind: ArenaRef["kind"], value: string) => {
  /**
   * Either form resolves. The slug is canonical and what every link now
   * carries; the id is what legacy `title-uuid` links carry and what client
   * code holds, and the page redirects one to the other rather than serving
   * an arena at two addresses.
   */
  const identity: Prisma.ArenaWhereInput =
    kind === "id" ? { id: value } : { slug: value };

  return prisma.arena.findFirst({
    where: { ...identity, isDeleted: false, publishedAt: { not: null } },
    select: ARENA_DETAIL_SELECT,
  });
});

/**
 * One arena, or null if this viewer may not see it.
 *
 * Returning null rather than a payload-plus-a-flag is the change that matters.
 * The previous version computed `canAccessPrivate` and handed it back in
 * `meta` alongside the full arena - and **nothing read it**. The detail page
 * never referenced the field, and its prop type did not even declare it, so
 * every private arena's brief, rules, deliverables and discussion rendered for
 * any anonymous visitor. A gate that returns data and trusts the caller to
 * check a boolean is not a gate.
 *
 * Two more filters that were missing entirely: an unpublished arena was
 * readable by URL, and a soft-deleted one was the only thing excluded.
 *
 * Membership is a one-row probe rather than a scan of a materialised
 * participant graph - the same shape `arenaListSelect` uses, and the reason the
 * detail select no longer ships anyone's `userId`.
 */
export async function getArenaDetail(
  ref: ArenaRef,
  currentUserId: string | null
): Promise<{ arena: ArenaDetailRow; meta: ArenaDetailMeta } | null> {
  const arena = await loadArenaRow(ref.kind, ref.kind === "id" ? ref.id : ref.slug);

  if (!arena) {
    return null;
  }

  // Sequential rather than parallel now, because the viewer probe needs the
  // arena's id and a slug lookup does not have one yet. One extra round trip
  // on a page that already makes several, in exchange for not resolving the
  // slug twice.
  const viewerEntry = await (currentUserId
    ? prisma.arenaEntry.findFirst({
        where: {
          arenaId: arena.id,
          withdrawnAt: null,
          OR: [
            { userId: currentUserId },
            { team: { members: { some: { userId: currentUserId } } } },
          ],
        },
        select: { id: true, teamId: true },
      })
    : Promise.resolve(null));

  const isOwner = currentUserId ? arena.creatorId === currentUserId : false;
  const isRegistered = viewerEntry !== null;

  // The gate, enforced rather than reported. A caller that gets null cannot
  // accidentally render what it was not allowed to fetch.
  if (arena.isPrivate && !isOwner && !isRegistered) {
    return null;
  }

  return {
    arena,
    meta: {
      isOwner,
      isRegistered,
      totalParticipants: arena._count.entries,
      viewerTeamId: viewerEntry?.teamId ?? null,
      canAccessPrivate: true,
    },
  };
}

/**
 * A free slug for this title.
 *
 * Reads only the slugs that could possibly collide - everything starting with
 * the base - rather than the whole table, so the uniqueness check costs one
 * indexed prefix scan whatever the arena count is.
 *
 * There is still a race between this and the insert, and that is fine: the
 * unique index refuses the loser, and the caller retries. A pre-check that
 * pretended to be a guarantee would be the worse version.
 */
async function nextArenaSlug(title: string, excludeId?: string): Promise<string> {
  const base = arenaSlugBase(title) || "arena";

  const neighbours = await prisma.arena.findMany({
    where: {
      slug: { startsWith: base },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  return uniqueArenaSlug(base, neighbours.map((row) => row.slug));
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
      slug: await nextArenaSlug(data.title),
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
      rules: data.rules,
      creatorId: data.creatorId,
    },
  });

  return { id: arena.id };
}

/**
 * The editable fields of one arena, for the host who is about to change them.
 *
 * Its own read rather than a reuse of `ARENA_DETAIL_SELECT`, because the two
 * want different things. The detail select is shaped by what a *reader* may
 * see - it carries participants and counts, and deliberately omits fields the
 * form owns like `requireHiringConsent`. Widening it so the edit screen could
 * borrow it would put those on the public payload for everyone.
 */
const ARENA_EDIT_FORM_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  rules: true,
  difficulty: true,
  creatorId: true,
  canceledAt: true,
  resultsPublishedAt: true,
  locationType: true,
  locationName: true,
  googleMapsUrl: true,
  isPrivate: true,
  inviteCode: true,
  isTeam: true,
  minTeamSize: true,
  maxTeamSize: true,
  maxParticipants: true,
  allowLeaderAccessControl: true,
  hasPrizePool: true,
  totalPrizePool: true,
  prizeCurrency: true,
  firstPlacePrize: true,
  secondPlacePrize: true,
  thirdPlacePrize: true,
  prizeDisbursementTerms: true,
  requireHiringConsent: true,
  companyId: true,
  requireGithubUrl: true,
  requireFigmaUrl: true,
  requireVideoUrl: true,
  requireWriteup: true,
  registrationStart: true,
  registrationEnd: true,
  ideaPhaseStart: true,
  ideaPhaseEnd: true,
  implPhaseStart: true,
  implPhaseEnd: true,
} satisfies Prisma.ArenaSelect;

export type ArenaEditFormRow = Prisma.ArenaGetPayload<{
  select: typeof ARENA_EDIT_FORM_SELECT;
}>;

/**
 * Null for anyone who is not the host, and for an arena that can no longer be
 * edited - the same refusal-not-report shape as `getArenaDetail`, so the page
 * above can only render a form it was allowed to fetch.
 */
export async function getArenaForEdit(
  ref: ArenaRef,
  userId: string,
  now: Date = new Date()
): Promise<ArenaEditFormRow | null> {
  const arena = await prisma.arena.findFirst({
    where: {
      ...(ref.kind === "id" ? { id: ref.id } : { slug: ref.slug }),
      isDeleted: false,
      creatorId: userId,
    },
    select: ARENA_EDIT_FORM_SELECT,
  });

  if (!arena) return null;

  // Mirrors what `updateArena` would refuse anyway. Showing the form first and
  // rejecting the save afterwards makes someone retype a brief to be told it
  // was never editable.
  if (arena.canceledAt || arena.resultsPublishedAt || now >= arena.implPhaseEnd) {
    return null;
  }

  return arena;
}
/**
 * Every field a host may change, and the schedule as it stands.
 *
 * Editing is a full-object PUT wearing PATCH's name: the edit screen is the
 * create form, so it submits every field, and merging a partial payload onto
 * a row would mean two validation paths for one schema - the second of which
 * nobody exercises until it is wrong.
 */
const ARENA_EDIT_GUARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  creatorId: true,
  canceledAt: true,
  resultsPublishedAt: true,
  registrationStart: true,
  registrationEnd: true,
  ideaPhaseStart: true,
  ideaPhaseEnd: true,
  implPhaseStart: true,
  implPhaseEnd: true,
} satisfies Prisma.ArenaSelect;

export type MutateArenaResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; status: 400 | 403 | 404 | 409; error: string };

/**
 * The first `prisma.arena.update` in the codebase.
 *
 * There was no PATCH, PUT or DELETE for an arena anywhere, which is why the
 * detail page carried two EDIT ARENA buttons with no `onClick` between them:
 * there was nothing for either of them to call.
 *
 * `authority` and `companyId` arrive as arguments for the same reason they do
 * in `createArena`. An edit that forwarded them from the body would reopen the
 * self-assignment hole `resolveArenaAuthority` exists to close, on a route
 * nobody thought to check because the create route had already been fixed.
 */
export async function updateArena(
  arenaId: string,
  editorId: string,
  data: ArenaFormOutput & { authority: ArenaAuthorityValue; companyId: string | null },
  now: Date = new Date()
): Promise<MutateArenaResult> {
  const current = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    select: ARENA_EDIT_GUARD_SELECT,
  });

  // 404 rather than 403 for a non-host, matching `getArenaDetail`: a private
  // arena's existence is not something a stranger's failed edit should confirm.
  if (!current || current.creatorId !== editorId) {
    return { ok: false, status: 404, error: "Arena not found." };
  }

  if (current.canceledAt) {
    return {
      ok: false,
      status: 409,
      error: "This arena was called off and can no longer be edited.",
    };
  }

  // Once the build window shuts, entries are in and judging is what happens
  // next. Changing the brief, the deliverables or the clock at that point
  // changes what people were judged against after they were judged.
  if (current.resultsPublishedAt || now >= current.implPhaseEnd) {
    return {
      ok: false,
      status: 409,
      error: "This arena has finished. Its brief is now a record of what was run.",
    };
  }

  const schedule = checkScheduleEdit(current, data, now);
  if (!schedule.ok) {
    return { ok: false, status: 400, error: schedule.error };
  }

  // Uniqueness excluding self, or a host who saves twice without touching the
  // code collides with their own arena.
  if (data.isPrivate && data.inviteCode) {
    const clash = await prisma.arena.findFirst({
      where: { inviteCode: data.inviteCode, id: { not: arenaId } },
      select: { id: true },
    });
    if (clash) {
      return {
        ok: false,
        status: 400,
        error: "This invitation code is already in use by another arena.",
      };
    }
  }

  const prizesAllowed = mayHavePrizePool(data.authority);

  /**
   * The slug follows a rename only until someone has entered.
   *
   * After that the address has been bookmarked, pasted into a group chat and
   * indexed, and a rename that moved it would break every one of those to fix
   * a typo. Before that it has been seen by the host and nobody else, so
   * keeping a wrong slug forever would be pedantry.
   *
   * The old slug is not kept as an alias. A redirect table is the right answer
   * once arenas are renamed often enough to need one; today no arena has ever
   * been renamed at all.
   */
  const entered = await prisma.arenaEntry.count({
    where: { arenaId, withdrawnAt: null },
  });
  const slug =
    entered === 0 && data.title !== current.title
      ? await nextArenaSlug(data.title, arenaId)
      : undefined;

  await prisma.arena.update({
    where: { id: arenaId },
    data: {
      title: data.title,
      ...(slug ? { slug } : {}),
      description: data.description,
      authority: data.authority as ArenaAuthority,
      difficulty: data.difficulty as DifficultyTier,
      locationType: data.locationType,
      locationName: data.locationType === "IN_PERSON" ? data.locationName || null : null,
      googleMapsUrl: data.locationType === "IN_PERSON" ? data.googleMapsUrl || null : null,
      isPrivate: data.isPrivate,
      inviteCode: data.isPrivate ? data.inviteCode || null : null,
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
      rules: data.rules,
    },
  });

  return { ok: true, id: arenaId, slug: slug ?? current.slug };
}

/**
 * Call an arena off. Soft, and the only thing that makes CANCELED reachable.
 *
 * `deriveArenaStatus` has reported CANCELED from `canceledAt` since the status
 * column was dropped, and nothing has ever written that timestamp - so one of
 * the eight statuses was decorative. It is a lifecycle flag rather than a
 * delete: entrants who cleared their weekend for this should find the arena
 * where they left it, saying what happened, not a 404.
 */
export async function cancelArena(
  arenaId: string,
  editorId: string,
  now: Date = new Date()
): Promise<MutateArenaResult> {
  const current = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    select: ARENA_EDIT_GUARD_SELECT,
  });

  if (!current || current.creatorId !== editorId) {
    return { ok: false, status: 404, error: "Arena not found." };
  }

  if (current.canceledAt) {
    // Idempotent on purpose: a double-submit is a double-submit, not an error
    // worth showing someone who already got what they asked for.
    return { ok: true, id: arenaId, slug: current.slug };
  }

  if (now >= current.implPhaseEnd) {
    return {
      ok: false,
      status: 409,
      error: "This arena already ran. It cannot be called off after the fact.",
    };
  }

  await prisma.arena.update({
    where: { id: arenaId },
    data: { canceledAt: now },
  });

  return { ok: true, id: arenaId, slug: current.slug };
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
  slug: string;
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
    slug: true,
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
      slug: r.slug,
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
