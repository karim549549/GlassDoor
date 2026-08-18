import "server-only";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import { deriveArenaStatus } from "./status";

/**
 * Invitations. The model has existed since the schema was written and had no
 * code behind it of any kind - its only reference anywhere was a `_count` in
 * `lib/arena/types.ts`, while PRD 7.1a talks about "pending invitations" as
 * though the feature shipped.
 *
 * It matters more than a nice-to-have, because it is the answer to the private
 * arena's real problem. Access today is one shared string that every entrant
 * knows and can forward, which is why that string leaking onto the public page
 * was as bad as it was. An invitation is per-person, revocable by declining,
 * and creates the entry directly - so a host can run a closed arena without
 * handing anyone a password.
 */

export type InvitationResult<T> = { ok: true; data: T } | { ok: false; status: 400 | 403 | 404 | 409; error: string };

/** What a host sees on their own arena. */
export const ARENA_INVITATION_SELECT = {
  id: true,
  status: true,
  createdAt: true,
  receiver: { select: { id: true, fullName: true, handle: true, avatarUrl: true } },
} satisfies Prisma.ArenaInvitationSelect;

export type ArenaInvitationRow = Prisma.ArenaInvitationGetPayload<{
  select: typeof ARENA_INVITATION_SELECT;
}>;

/** What an invitee sees on their own board. */
export const RECEIVED_INVITATION_SELECT = {
  id: true,
  status: true,
  createdAt: true,
  sender: { select: { fullName: true, handle: true, avatarUrl: true } },
  arena: {
    select: {
      id: true,
      title: true,
      slug: true,
      isTeam: true,
      isPrivate: true,
      difficulty: true,
      locationType: true,
      publishedAt: true,
      canceledAt: true,
      resultsPublishedAt: true,
      registrationStart: true,
      registrationEnd: true,
      ideaPhaseStart: true,
      ideaPhaseEnd: true,
      implPhaseStart: true,
      implPhaseEnd: true,
    },
  },
} satisfies Prisma.ArenaInvitationSelect;

export type ReceivedInvitationRow = Prisma.ArenaInvitationGetPayload<{
  select: typeof RECEIVED_INVITATION_SELECT;
}>;

/**
 * Invite one person, by handle.
 *
 * Handle rather than user id, because that is what a host knows. A host types
 * the name they saw on someone's profile; asking them for a uuid would mean
 * building a person-picker before the feature could ship at all.
 */
export async function sendInvitation(params: {
  arenaId: string;
  senderId: string;
  handle: string;
  now?: Date;
}): Promise<InvitationResult<ArenaInvitationRow>> {
  const { arenaId, senderId, handle, now = new Date() } = params;

  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    select: {
      id: true,
      creatorId: true,
      publishedAt: true,
      canceledAt: true,
      resultsPublishedAt: true,
      registrationStart: true,
      registrationEnd: true,
      ideaPhaseStart: true,
      ideaPhaseEnd: true,
      implPhaseStart: true,
      implPhaseEnd: true,
    },
  });

  // 404, not 403, for the same reason every other arena gate answers that way:
  // a stranger's failed invite should not confirm a private arena exists.
  if (!arena || arena.creatorId !== senderId) {
    return { ok: false, status: 404, error: "Arena not found." };
  }

  const status = deriveArenaStatus(arena, now);
  if (status !== "SCHEDULED" && status !== "REGISTRATION_OPEN") {
    return {
      ok: false,
      status: 409,
      error: "Registration has closed, so there is nothing left to invite someone to.",
    };
  }

  const receiver = await prisma.user.findFirst({
    where: { handle: { equals: handle.trim().replace(/^@/, ""), mode: "insensitive" } },
    select: { id: true },
  });

  if (!receiver) {
    return { ok: false, status: 404, error: "No one here goes by that handle." };
  }

  if (receiver.id === senderId) {
    return { ok: false, status: 400, error: "You are already running this one." };
  }

  const alreadyIn = await prisma.arenaEntry.findFirst({
    where: {
      arenaId,
      withdrawnAt: null,
      OR: [
        { userId: receiver.id },
        { team: { members: { some: { userId: receiver.id } } } },
      ],
    },
    select: { id: true },
  });

  if (alreadyIn) {
    return { ok: false, status: 409, error: "They have already entered." };
  }

  try {
    const invitation = await prisma.arenaInvitation.create({
      data: { arenaId, senderId, receiverId: receiver.id },
      select: ARENA_INVITATION_SELECT,
    });
    return { ok: true, data: invitation };
  } catch (err) {
    // The unique index on (arenaId, receiverId) is the real guard - a check
    // before the insert loses to two clicks in the same second.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, status: 409, error: "They have already been invited." };
    }
    throw err;
  }
}

/**
 * Accept or decline. Invitee only.
 *
 * Accepting creates the entry directly, without the invite code - that is the
 * entire point. It deliberately does not go through `joinArena`, whose private
 * branch compares a shared string the invitee was never given.
 */
export async function respondToInvitation(params: {
  invitationId: string;
  userId: string;
  accept: boolean;
  now?: Date;
}): Promise<InvitationResult<{ status: "ACCEPTED" | "REJECTED"; arenaId: string }>> {
  const { invitationId, userId, accept, now = new Date() } = params;

  const invitation = await prisma.arenaInvitation.findUnique({
    where: { id: invitationId },
    select: {
      id: true,
      status: true,
      receiverId: true,
      arenaId: true,
      arena: {
        select: {
          isTeam: true,
          maxParticipants: true,
          publishedAt: true,
          canceledAt: true,
          resultsPublishedAt: true,
          registrationStart: true,
          registrationEnd: true,
          ideaPhaseStart: true,
          ideaPhaseEnd: true,
          implPhaseStart: true,
          implPhaseEnd: true,
          _count: { select: { entries: true } },
        },
      },
    },
  });

  if (!invitation || invitation.receiverId !== userId) {
    return { ok: false, status: 404, error: "Invitation not found." };
  }

  if (invitation.status !== "PENDING") {
    return { ok: false, status: 409, error: "You have already answered this one." };
  }

  if (!accept) {
    await prisma.arenaInvitation.update({
      where: { id: invitation.id },
      data: { status: "REJECTED" },
    });
    return { ok: true, data: { status: "REJECTED", arenaId: invitation.arenaId } };
  }

  const arenaStatus = deriveArenaStatus(invitation.arena, now);
  if (arenaStatus !== "REGISTRATION_OPEN") {
    return {
      ok: false,
      status: 409,
      error:
        arenaStatus === "SCHEDULED"
          ? "Registration has not opened yet. The invitation keeps until it does."
          : "Registration has closed on this one.",
    };
  }

  const { maxParticipants, _count } = invitation.arena;
  if (maxParticipants && _count.entries >= maxParticipants) {
    return { ok: false, status: 409, error: "This arena is full." };
  }

  /**
   * Both writes or neither. An accepted invitation with no entry behind it is
   * the worst outcome available here: the invitee is told they are in, the
   * host's roster disagrees, and nothing in the UI can tell them apart.
   */
  await prisma.$transaction(async (tx) => {
    await tx.arenaInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    // `upsert` on the (arenaId, userId) unique pair, so someone who entered
    // and withdrew before accepting an older invitation comes back rather than
    // colliding with their own dead row.
    await tx.arenaEntry.upsert({
      where: { arenaId_userId: { arenaId: invitation.arenaId, userId } },
      create: { arenaId: invitation.arenaId, userId },
      update: { withdrawnAt: null, joinedAt: now },
    });
  });

  return { ok: true, data: { status: "ACCEPTED", arenaId: invitation.arenaId } };
}

/** The roster of invitations a host has sent on one arena. */
export async function listInvitationsForArena(
  arenaId: string,
  hostId: string
): Promise<InvitationResult<ArenaInvitationRow[]>> {
  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false, creatorId: hostId },
    select: { id: true },
  });

  if (!arena) {
    return { ok: false, status: 404, error: "Arena not found." };
  }

  const invitations = await prisma.arenaInvitation.findMany({
    where: { arenaId },
    select: ARENA_INVITATION_SELECT,
    orderBy: { createdAt: "desc" },
  });

  return { ok: true, data: invitations };
}

/**
 * Pending invitations addressed to one person.
 *
 * Pending only, and only for arenas that are still worth answering. An
 * invitation to something that finished last month is not news; it is a row
 * that makes the badge lie.
 */
export async function listInvitationsForUser(
  userId: string,
  now: Date = new Date()
): Promise<ReceivedInvitationRow[]> {
  const invitations = await prisma.arenaInvitation.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
      arena: { isDeleted: false, canceledAt: null, registrationEnd: { gt: now } },
    },
    select: RECEIVED_INVITATION_SELECT,
    orderBy: { createdAt: "desc" },
  });

  return invitations;
}
