import "server-only";
import prisma from "@/lib/server/prisma";
import { deriveArenaStatus } from "./status";

export interface JoinArenaResult {
  success?: boolean;
  entryId?: string;
  error?: string;
}

/**
 * Persists a user's direct entry into an arena.
 * Validates registration window, private access codes, and capacity limits.
 */
export async function joinArena(
  arenaId: string,
  userId: string,
  inviteCode?: string | null
): Promise<JoinArenaResult> {
  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    include: {
      entries: { where: { withdrawnAt: null } },
      teams: { include: { members: true } },
    },
  });

  if (!arena) {
    return { error: "Arena not found." };
  }

  const now = new Date();
  const status = deriveArenaStatus(arena, now);
  if (status !== "REGISTRATION_OPEN") {
    return { error: `Cannot join arena in ${status} status. Registration is closed.` };
  }

  if (arena.isPrivate) {
    if (!inviteCode || inviteCode.trim() !== (arena.inviteCode || "").trim()) {
      return { error: "Invalid private invitation code." };
    }
  }

  const currentCount = arena.isTeam
    ? arena.teams.reduce((acc, t) => acc + t.members.length, 0)
    : arena.entries.length;

  if (arena.maxParticipants && currentCount >= arena.maxParticipants) {
    return { error: "Arena has reached its maximum participant limit." };
  }

  // Check existing entry
  const existing = await prisma.arenaEntry.findFirst({
    where: { arenaId, userId },
  });

  if (existing) {
    if (!existing.withdrawnAt) {
      return { success: true, entryId: existing.id };
    }
    // Re-activate previously withdrawn entry
    const updated = await prisma.arenaEntry.update({
      where: { id: existing.id },
      data: { withdrawnAt: null, joinedAt: new Date() },
    });
    return { success: true, entryId: updated.id };
  }

  const entry = await prisma.arenaEntry.create({
    data: {
      arenaId,
      userId,
    },
  });

  return { success: true, entryId: entry.id };
}

/**
 * Withdraws a user's direct entry from an arena.
 */
export async function leaveArena(arenaId: string, userId: string): Promise<{ success?: boolean; error?: string }> {
  const existing = await prisma.arenaEntry.findFirst({
    where: { arenaId, userId, withdrawnAt: null },
  });

  if (!existing) {
    return { error: "You are not currently an active participant in this arena." };
  }

  await prisma.arenaEntry.update({
    where: { id: existing.id },
    data: { withdrawnAt: new Date() },
  });

  return { success: true };
}

/**
 * Creates a new squad team and enters it into the arena.
 */
export async function createArenaTeam(
  arenaId: string,
  leaderUserId: string,
  teamName: string
): Promise<{ success?: boolean; teamId?: string; error?: string }> {
  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    include: { teams: { include: { members: true } } },
  });

  if (!arena) {
    return { error: "Arena not found." };
  }

  if (!arena.isTeam) {
    return { error: "This arena is solo-only and does not permit teams." };
  }

  const status = deriveArenaStatus(arena, new Date());
  if (status !== "REGISTRATION_OPEN") {
    return { error: `Cannot form teams during ${status} status.` };
  }

  // Check if leader is already on another team in this arena
  const alreadyInTeam = arena.teams.some((t) =>
    t.members.some((m) => m.userId === leaderUserId)
  );
  if (alreadyInTeam) {
    return { error: "You are already a member of a team in this arena." };
  }

  const cleanName = teamName.trim();
  const existingName = await prisma.arenaTeam.findFirst({
    where: { arenaId, name: { equals: cleanName, mode: "insensitive" } },
  });
  if (existingName) {
    return { error: "A team with this name already exists in this arena." };
  }

  return await prisma.$transaction(async (tx) => {
    const team = await tx.arenaTeam.create({
      data: {
        arenaId,
        name: cleanName,
        members: {
          create: {
            userId: leaderUserId,
            isLeader: true,
          },
        },
      },
    });

    await tx.arenaEntry.create({
      data: {
        arenaId,
        teamId: team.id,
      },
    });

    return { success: true, teamId: team.id };
  });
}
