import { Prisma } from "@prisma/client";

/**
 * Explicit field allow-list for list/browse queries.
 *
 * Deliberately excludes `inviteCode` (the secret that gates private-arena
 * access) and the `createdAt`/`updatedAt` timestamps, since this shape is
 * returned to unauthenticated callers via GET /api/arena.
 *
 * SLIMMED, and it mattered. This used to pull `rulesText` - a `@db.Text`
 * column no list has ever rendered - plus every `ArenaEntry` row and every
 * `ArenaTeam` with all of its members, for each of up to fifty arenas on a
 * page. Listing the board therefore fetched every participant of every arena
 * on it to render a number. AGENTS.md: select only the fields the response
 * actually uses; watch for a list query followed by a per-row query.
 *
 * The counts come from `_count` now, which Postgres answers with an aggregate
 * instead of shipping the rows. Whether *you* are in an arena is a separate,
 * viewer-scoped question - see `arenaListSelect` below, which adds a filtered
 * one-row probe only when there is a viewer to ask about.
 *
 * `format` and `intent` are gone with them: both are dead columns awaiting a
 * migration, and neither was ever rendered.
 */
export const ARENA_LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  authority: true,
  difficulty: true,
  publishedAt: true,
  canceledAt: true,
  resultsPublishedAt: true,
  locationType: true,
  locationName: true,
  isPrivate: true,
  isTeam: true,
  minTeamSize: true,
  maxTeamSize: true,
  maxParticipants: true,
  hasPrizePool: true,
  totalPrizePool: true,
  prizeCurrency: true,
  registrationStart: true,
  registrationEnd: true,
  ideaPhaseStart: true,
  ideaPhaseEnd: true,
  implPhaseStart: true,
  implPhaseEnd: true,
  creatorId: true,
  companyId: true,
  creator: { select: { id: true, handle: true, fullName: true, avatarUrl: true } },
  _count: { select: { entries: true, teams: true } },
} satisfies Prisma.ArenaSelect;

/**
 * The list select, plus a probe for whether this viewer is already in.
 *
 * `take: 1` and `select: { id }`: the row's contents are irrelevant, only
 * whether one exists. Returning the full entry would put another caller's
 * `userId` in a payload served to anyone.
 *
 * A function rather than a second constant because the filter depends on who
 * is asking, and a static select cannot express that.
 */
export function arenaListSelect(viewerId: string | null) {
  if (!viewerId) return ARENA_LIST_SELECT;
  return {
    ...ARENA_LIST_SELECT,
    entries: {
      where: { userId: viewerId, withdrawnAt: null },
      select: { id: true },
      take: 1,
    },
  } satisfies Prisma.ArenaSelect;
}


export type ArenaListItem = Prisma.ArenaGetPayload<{ select: typeof ARENA_LIST_SELECT }> & {
  /**
   * One row at most, and only when the query ran on behalf of a signed-in
   * viewer - see `arenaListSelect`. Its presence is the whole signal: a
   * non-empty array means "you are in this one". Optional because the
   * logged-out query does not ask.
   */
  entries?: { id: string }[];
};

export const REQUIRED_SERIALIZED_DATE_FIELDS = [
  "registrationStart",
  "registrationEnd",
  "ideaPhaseStart",
  "ideaPhaseEnd",
  "implPhaseStart",
  "implPhaseEnd",
] as const;

export const NULLABLE_SERIALIZED_DATE_FIELDS = [
  "publishedAt",
  "canceledAt",
  "resultsPublishedAt",
] as const;

export const SERIALIZED_DATE_FIELDS = [
  ...REQUIRED_SERIALIZED_DATE_FIELDS,
  ...NULLABLE_SERIALIZED_DATE_FIELDS,
] as const;

/** ArenaListItem with Date fields converted to ISO strings, for the SSR -> client serialization boundary. */
export type SerializedArenaListItem = Omit<ArenaListItem, (typeof SERIALIZED_DATE_FIELDS)[number]> & {
  [K in (typeof REQUIRED_SERIALIZED_DATE_FIELDS)[number]]: string;
} & {
  [K in (typeof NULLABLE_SERIALIZED_DATE_FIELDS)[number]]: string | null;
};

/**
 * The detail query, as a `select` rather than an `include`.
 *
 * It was an `include`, which means every scalar column of `Arena` came back -
 * `inviteCode` among them, the shared secret that is the entire access control
 * on a private arena. It then pulled every `ArenaEntry` with its user, and
 * every `ArenaTeam` with every member's `userId`, withdrawn entries included,
 * in order to compute three booleans and one integer the page never used. All
 * of it went verbatim to `GET /api/arena/[id]`, which is public.
 *
 * `arenaListSelect` forty lines above already solved this shape: a `_count`
 * for totals, and a narrow probe for "is this viewer in it". The detail path
 * never got the fix.
 *
 * `inviteCode` IS selected - a host has to be able to read it - but it leaves
 * through `lib/arena/dto.ts`, which drops it for everyone else. Same rule
 * `USER_PROFILE_SELECT` follows for `email`: fetch it where a legitimate
 * reader needs it, and let the DTO decide who that is.
 */
export const ARENA_DETAIL_SELECT = {
  id: true,
  title: true,
  description: true,
  rulesText: true,
  authority: true,
  difficulty: true,
  publishedAt: true,
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
  hasPrizePool: true,
  totalPrizePool: true,
  prizeCurrency: true,
  firstPlacePrize: true,
  secondPlacePrize: true,
  thirdPlacePrize: true,
  prizeDisbursementTerms: true,
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
  creatorId: true,
  creator: { select: { id: true, fullName: true, handle: true, avatarUrl: true } },
  companyId: true,
  company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },

  /**
   * Named participants, without their ids.
   *
   * Withdrawn entries are excluded in the query rather than filtered in the
   * page: someone who quit is not a participant, and shipping their row so the
   * client can hide it is how they become visible again after a refactor.
   */
  entries: {
    where: { withdrawnAt: null },
    select: {
      id: true,
      joinedAt: true,
      user: { select: { fullName: true, handle: true, avatarUrl: true } },
      team: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              isLeader: true,
              user: { select: { fullName: true, handle: true, avatarUrl: true } },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  },

  _count: { select: { entries: true, teams: true, invitations: true } },
} satisfies Prisma.ArenaSelect;

export type ArenaDetailRow = Prisma.ArenaGetPayload<{ select: typeof ARENA_DETAIL_SELECT }>;
