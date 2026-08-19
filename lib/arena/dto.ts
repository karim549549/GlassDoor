import { z } from "zod";
import type { ArenaDetailRow } from "./types";
import type { ArenaStatus } from "./status";

/**
 * The public shape of one arena, and the only place that decides who sees what.
 *
 * `lib/arena/` was the largest domain in the app and the only one without a
 * DTO, so `getArenaDetail` handed the raw Prisma payload straight to the page
 * *and* to `GET /api/arena/[id]`, which is public. Two things went out with it
 * that should never have:
 *
 *   `inviteCode` - the shared secret that is the entire access control on a
 *   private arena. `participation-service.ts` compares against exactly that
 *   string, and it was rendered in plain text on the public page.
 *
 *   Every participant's `User.id`, for every entry and every team member,
 *   people who had withdrawn included. `lib/arena/types.ts` already carried a
 *   comment explaining why the *list* select must not do this; the detail path
 *   did it anyway.
 *
 * Both are handled here rather than at each call site, because a rule enforced
 * per-caller is a rule that the next caller forgets. `toArenaDetailDto` takes
 * the viewer's relationship and emits a payload that is safe to serialise to
 * them - `inviteCode` for the host, no user id field for anyone.
 *
 * One honest caveat on that second one: avatars are stored in public storage
 * as `avatars/<userId>.jpg`, so `avatarUrl` still spells out the id of anyone
 * who has uploaded one. That is not a hole this file can close - it is a
 * storage-naming decision - and it is not a credential either, since
 * `/user/[id]` is a public route the board already links to. It does mean the
 * rule here is "no id field", not "no id anywhere", and anything that ever
 * makes a user id sensitive has to fix the filename first.
 */

const participantSchema = z.object({
  /** The entry's own id. Safe: it identifies a row, not a person. */
  entryId: z.string(),
  displayName: z.string(),
  handle: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  /** Present when this entry is a team's, so the list can group. */
  teamName: z.string().nullable(),
  isTeamLeader: z.boolean(),
});

export const arenaDetailDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** The canonical URL segment. Every link to this arena is built from it. */
  slug: z.string(),
  description: z.string(),
  rules: z.array(z.string()),
  status: z.string(),
  authority: z.string(),
  difficulty: z.string(),

  locationType: z.string(),
  locationName: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),

  isPrivate: z.boolean(),
  /**
   * Host only. Absent - not null - for everyone else, so a component cannot
   * render it by accident from a payload that never carried it.
   */
  inviteCode: z.string().nullable().optional(),

  isTeam: z.boolean(),
  minTeamSize: z.number(),
  maxTeamSize: z.number(),
  maxParticipants: z.number().nullable(),

  hasPrizePool: z.boolean(),
  totalPrizePool: z.number().nullable(),
  prizeCurrency: z.string(),
  firstPlacePrize: z.number().nullable(),
  secondPlacePrize: z.number().nullable(),
  thirdPlacePrize: z.number().nullable(),
  prizeDisbursementTerms: z.string().nullable(),

  requireGithubUrl: z.boolean(),
  requireFigmaUrl: z.boolean(),
  requireVideoUrl: z.boolean(),
  requireWriteup: z.boolean(),

  registrationStart: z.string(),
  registrationEnd: z.string(),
  ideaPhaseStart: z.string(),
  ideaPhaseEnd: z.string(),
  implPhaseStart: z.string(),
  implPhaseEnd: z.string(),

  creator: z.object({
    id: z.string(),
    fullName: z.string().nullable(),
    handle: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  company: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      logoUrl: z.string().nullable(),
      isVerified: z.boolean(),
    })
    .nullable(),

  participants: z.array(participantSchema),
  entrantCount: z.number(),
  teamCount: z.number(),
});

export type ArenaDetailDto = z.infer<typeof arenaDetailDtoSchema>;

/**
 * How this viewer stands to this arena.
 *
 * One discriminated value derived once on the server, rather than four
 * booleans each component re-interprets. The detail page previously worked
 * from `isHost`, `isJoined`, `isGuest` and `isRegistered` scattered across two
 * components that implemented the same seven-branch decision twice.
 */
export type ViewerRelationship = "guest" | "visitor" | "entrant" | "host";

export interface ArenaViewer {
  relationship: ViewerRelationship;
  /** Convenience for the many places that only care about this one. */
  isHost: boolean;
}

export function resolveViewer(params: {
  userId: string | null;
  creatorId: string;
  isRegistered: boolean;
}): ArenaViewer {
  if (!params.userId) return { relationship: "guest", isHost: false };
  if (params.userId === params.creatorId) return { relationship: "host", isHost: true };
  if (params.isRegistered) return { relationship: "entrant", isHost: false };
  return { relationship: "visitor", isHost: false };
}

/** `Decimal | null` from Prisma to a plain number, which JSON can carry. */
function money(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function displayNameOf(user: { fullName: string | null; handle: string | null }): string {
  return user.fullName ?? (user.handle ? `@${user.handle}` : "Someone");
}

/**
 * Flattens entries and their teams into one participant list.
 *
 * A team entry contributes its members; a solo entry contributes its user. The
 * page previously received both `entries` and `teams` - overlapping views of
 * the same people - and had to reconcile them itself.
 */
function participantsOf(raw: ArenaDetailRow): ArenaDetailDto["participants"] {
  type Participant = ArenaDetailDto["participants"][number];

  // The annotation is load-bearing: the team branch widens `teamName` to
  // `string` and the solo branch narrows it to `null`, so without it flatMap
  // infers a union of two array types rather than one array of a union.
  return raw.entries.flatMap((entry): Participant[] => {
    if (entry.team) {
      return entry.team.members.map((member) => ({
        entryId: entry.id,
        displayName: displayNameOf(member.user),
        handle: member.user.handle,
        avatarUrl: member.user.avatarUrl,
        teamName: entry.team!.name,
        isTeamLeader: member.isLeader,
      }));
    }

    if (!entry.user) return [];

    return [
      {
        entryId: entry.id,
        displayName: displayNameOf(entry.user),
        handle: entry.user.handle,
        avatarUrl: entry.user.avatarUrl,
        teamName: null,
        isTeamLeader: false,
      },
    ];
  });
}

export function toArenaDetailDto(
  raw: ArenaDetailRow,
  status: ArenaStatus,
  viewer: ArenaViewer
): ArenaDetailDto {
  const iso = (d: Date) => d.toISOString();

  return arenaDetailDtoSchema.parse({
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    rules: raw.rules,
    status,
    authority: raw.authority,
    difficulty: raw.difficulty,

    locationType: raw.locationType,
    locationName: raw.locationName,
    googleMapsUrl: raw.googleMapsUrl,

    isPrivate: raw.isPrivate,
    // The whole point of this file.
    ...(viewer.isHost ? { inviteCode: raw.inviteCode } : {}),

    isTeam: raw.isTeam,
    minTeamSize: raw.minTeamSize,
    maxTeamSize: raw.maxTeamSize,
    maxParticipants: raw.maxParticipants,

    hasPrizePool: raw.hasPrizePool,
    totalPrizePool: money(raw.totalPrizePool),
    prizeCurrency: raw.prizeCurrency,
    firstPlacePrize: money(raw.firstPlacePrize),
    secondPlacePrize: money(raw.secondPlacePrize),
    thirdPlacePrize: money(raw.thirdPlacePrize),
    prizeDisbursementTerms: raw.prizeDisbursementTerms,

    requireGithubUrl: raw.requireGithubUrl,
    requireFigmaUrl: raw.requireFigmaUrl,
    requireVideoUrl: raw.requireVideoUrl,
    requireWriteup: raw.requireWriteup,

    registrationStart: iso(raw.registrationStart),
    registrationEnd: iso(raw.registrationEnd),
    ideaPhaseStart: iso(raw.ideaPhaseStart),
    ideaPhaseEnd: iso(raw.ideaPhaseEnd),
    implPhaseStart: iso(raw.implPhaseStart),
    implPhaseEnd: iso(raw.implPhaseEnd),

    creator: raw.creator,
    company: raw.company,

    participants: participantsOf(raw),
    entrantCount: raw._count.entries,
    teamCount: raw._count.teams,
  });
}
