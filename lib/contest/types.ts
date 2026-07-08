import { Prisma } from "@prisma/client";

/**
 * Explicit field allow-list for list/browse queries. Deliberately excludes
 * `inviteCode` (the secret that gates private-contest access) and the
 * `createdAt`/`updatedAt` timestamps, since this shape is returned to
 * unauthenticated callers via GET /api/contest.
 */
export const CONTEST_LIST_SELECT = {
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
} satisfies Prisma.ContestSelect;

export type ContestListItem = Prisma.ContestGetPayload<{ select: typeof CONTEST_LIST_SELECT }>;

export const SERIALIZED_DATE_FIELDS = [
  "registrationStart",
  "registrationEnd",
  "ideaPhaseStart",
  "ideaPhaseEnd",
  "implPhaseStart",
  "implPhaseEnd",
] as const;

/** ContestListItem with Date fields converted to ISO strings, for the SSR -> client serialization boundary. */
export type SerializedContestListItem = Omit<ContestListItem, (typeof SERIALIZED_DATE_FIELDS)[number]> & {
  [K in (typeof SERIALIZED_DATE_FIELDS)[number]]: string;
};

/** Full detail query shape, used by the contest detail page/API. */
export const CONTEST_DETAIL_INCLUDE = {
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
} satisfies Prisma.ContestInclude;

export type ContestDetail = Prisma.ContestGetPayload<{ include: typeof CONTEST_DETAIL_INCLUDE }>;

export interface ContestDetailMeta {
  isOwner: boolean;
  isRegistered: boolean;
  totalParticipants: number;
}
