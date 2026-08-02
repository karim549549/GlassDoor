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
  coverImageUrl: true,
  status: true,
  isPrivate: true,
  isTeam: true,
  minTeamSize: true,
  maxTeamSize: true,
  maxParticipants: true,
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
  teams: {
    select: {
      id: true,
      members: {
        select: {
          userId: true,
        },
      },
    },
  },
} satisfies Prisma.ArenaSelect;

export type ArenaListItem = Prisma.ArenaGetPayload<{ select: typeof ARENA_LIST_SELECT }>;

export const SERIALIZED_DATE_FIELDS = [
  "registrationStart",
  "registrationEnd",
  "ideaPhaseStart",
  "ideaPhaseEnd",
  "implPhaseStart",
  "implPhaseEnd",
] as const;

/** ArenaListItem with Date fields converted to ISO strings, for the SSR -> client serialization boundary. */
export type SerializedArenaListItem = Omit<ArenaListItem, (typeof SERIALIZED_DATE_FIELDS)[number]> & {
  [K in (typeof SERIALIZED_DATE_FIELDS)[number]]: string;
};

/** Full detail query shape, used by the arena detail page/API. */
export const ARENA_DETAIL_INCLUDE = {
  creator: {
    select: { id: true, fullName: true, handle: true, avatarUrl: true },
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
      teams: true,
      invitations: true,
    },
  },
} satisfies Prisma.ArenaInclude;

export type ArenaDetail = Prisma.ArenaGetPayload<{ include: typeof ARENA_DETAIL_INCLUDE }>;

export interface ArenaDetailMeta {
  isOwner: boolean;
  isRegistered: boolean;
  totalParticipants: number;
}
