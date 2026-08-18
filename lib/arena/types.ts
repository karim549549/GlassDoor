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
  creator: { select: { handle: true, fullName: true } },
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

/** Full detail query shape, used by the arena detail page/API. */
export const ARENA_DETAIL_INCLUDE = {
  creator: {
    select: { id: true, fullName: true, handle: true, avatarUrl: true },
  },
  company: {
    select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true },
  },
  sponsors: {
    include: {
      company: { select: { id: true, name: true, slug: true, logoUrl: true } },
    },
  },
  entries: {
    include: {
      user: { select: { id: true, fullName: true, handle: true, avatarUrl: true } },
      team: {
        include: {
          members: {
            include: {
              user: { select: { id: true, fullName: true, handle: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  },
  teams: {
    include: {
      members: {
        include: {
          user: { select: { id: true, fullName: true, handle: true, avatarUrl: true } },
        },
      },
    },
  },
  _count: {
    select: {
      entries: true,
      teams: true,
      invitations: true,
    },
  },
} satisfies Prisma.ArenaInclude;

export type ArenaDetail = Prisma.ArenaGetPayload<{ include: typeof ARENA_DETAIL_INCLUDE }>;
