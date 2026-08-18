import { Prisma } from "@prisma/client";

/**
 * Explicit field allow-list for list/browse queries. Deliberately excludes
 * `inviteCode` (the secret that gates private-arena access) and the
 * `createdAt`/`updatedAt` timestamps, since this shape is returned to
 * unauthenticated callers via GET /api/arena.
 */
export const ARENA_LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  format: true,
  authority: true,
  intent: true,
  domain: true,
  difficulty: true,
  publishedAt: true,
  canceledAt: true,
  resultsPublishedAt: true,
  locationType: true,
  locationName: true,
  googleMapsUrl: true,
  isPrivate: true,
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
  registrationStart: true,
  registrationEnd: true,
  ideaPhaseStart: true,
  ideaPhaseEnd: true,
  implPhaseStart: true,
  implPhaseEnd: true,
  requireGithubUrl: true,
  requireFigmaUrl: true,
  requireVideoUrl: true,
  requireWriteup: true,
  rulesText: true,
  creatorId: true,
  companyId: true,
  entries: {
    select: {
      id: true,
      userId: true,
      teamId: true,
      withdrawnAt: true,
    },
  },
  teams: {
    select: {
      id: true,
      name: true,
      members: {
        select: {
          userId: true,
        },
      },
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          category: true,
        },
      },
    },
  },
} satisfies Prisma.ArenaSelect;

export type ArenaListItem = Prisma.ArenaGetPayload<{ select: typeof ARENA_LIST_SELECT }>;

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
  tags: {
    select: {
      tag: { select: { id: true, name: true, slug: true, color: true } },
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
