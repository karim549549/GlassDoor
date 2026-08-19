import "server-only";
import prisma from "@/lib/server/prisma";
import { deriveArenaStatus } from "./status";

/**
 * A host runs the arena or competes in it, never both.
 *
 * The rule was drawn in the UI - the action panel has never offered a host an
 * Enter button - and nowhere else, so `POST /api/arena/[id]/join` accepted a
 * creator entering their own arena and the roster listed them. It is the same
 * line `lib/arena/authority.ts` draws for judging, and for the same reason:
 * whoever sets the brief and the clock cannot also be measured against them.
 */
const HOST_CANNOT_ENTER =
  "You are running this arena. You cannot enter it as well.";

/**
 * Teams are fluid until the planning window opens, and fixed from then on.
 *
 * Not "until registration closes", which is where this rule started. There is
 * usually a gap between entries shutting and the clock starting, and that gap
 * is exactly when people sort themselves out — someone's team never filled,
 * someone else's friend did not turn up. Locking at registration close threw
 * that away for no gain.
 *
 * It locks at `ideaPhaseStart` rather than later because from that moment a
 * team is working: whatever it plans, it plans together, and a member who
 * leaves at minute forty takes half the plan with them.
 */
export function teamsAreOpen(
  arena: { registrationStart: Date; ideaPhaseStart: Date },
  now: Date
): boolean {
  return now >= arena.registrationStart && now < arena.ideaPhaseStart;
}

const TEAMS_LOCKED =
  "The planning window has opened, so teams are fixed for the rest of this arena.";

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

  if (arena.creatorId === userId) {
    return { error: HOST_CANNOT_ENTER };
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
 * Leaves an arena, whether the entry is solo or through a team.
 *
 * It only ever handled solo entries, so once teams existed a member who
 * clicked Leave was told they were "not currently an active participant" -
 * while their name sat in a team card on the page behind the message.
 *
 * A team that loses its last member withdraws its entry too. An empty team
 * holding a seat in a capped arena is a seat nobody can use.
 */
export async function leaveArena(
  arenaId: string,
  userId: string,
  now: Date = new Date()
): Promise<{ success?: boolean; error?: string }> {
  const [arena, soloEntry, membership] = await Promise.all([
    prisma.arena.findFirst({
      where: { id: arenaId, isDeleted: false },
      select: { registrationStart: true, ideaPhaseStart: true },
    }),
    prisma.arenaEntry.findFirst({
      where: { arenaId, userId, withdrawnAt: null },
      select: { id: true },
    }),
    prisma.arenaTeamMember.findFirst({
      where: { userId, team: { arenaId } },
      select: {
        teamId: true,
        isLeader: true,
        team: { select: { _count: { select: { members: true } } } },
      },
    }),
  ]);

  if (!arena) return { error: "Arena not found." };

  if (!soloEntry && !membership) {
    return { error: "You are not currently an active participant in this arena." };
  }

  // A solo entrant may still withdraw once the clock starts - they are
  // nobody's teammate. A team member may not.
  if (membership && !teamsAreOpen(arena, now)) {
    return { error: TEAMS_LOCKED };
  }

  await prisma.$transaction(async (tx) => {
    if (soloEntry) {
      await tx.arenaEntry.update({
        where: { id: soloEntry.id },
        data: { withdrawnAt: now },
      });
    }

    if (!membership) return;

    await tx.arenaTeamMember.delete({
      where: { teamId_userId: { teamId: membership.teamId, userId } },
    });

    /**
     * The last one out deletes the team.
     *
     * An empty team held its name — which is unique per arena, so nobody could
     * reuse it — and a live entry, which counted a seat nobody could take. It
     * is a row representing a thing that no longer exists.
     */
    if (membership.team._count.members <= 1) {
      await tx.arenaEntry.deleteMany({ where: { arenaId, teamId: membership.teamId } });
      await tx.arenaTeam.delete({ where: { id: membership.teamId } });
      return;
    }

    /**
     * Leadership passes to whoever joined next, and so on down the line.
     *
     * The only succession rule that needs a decision from nobody — no vote, no
     * prompt at the worst possible moment, no team left leaderless because the
     * leader closed the tab. Seniority on the team is the closest thing to a
     * natural answer.
     */
    if (membership.isLeader) {
      const next = await tx.arenaTeamMember.findFirst({
        where: { teamId: membership.teamId },
        orderBy: { joinedAt: "asc" },
        select: { userId: true },
      });

      if (next) {
        await tx.arenaTeamMember.update({
          where: { teamId_userId: { teamId: membership.teamId, userId: next.userId } },
          data: { isLeader: true },
        });
      }
    }
  });

  return { success: true };
}

/**
 * Takes a free seat on an existing team.
 *
 * `ArenaTeamMember` had no code path that added anyone but a leader:
 * `createArenaTeam` nested one member at creation and nothing else ever wrote
 * to the table, so a team arena could not actually form a team. The lobby on
 * the arena page draws every unfilled seat, which made the absence of this
 * function the most visible missing thing on the site.
 */
export async function joinArenaTeam(
  arenaId: string,
  teamId: string,
  userId: string
): Promise<{ success?: boolean; teamId?: string; error?: string }> {
  const arena = await prisma.arena.findFirst({
    where: { id: arenaId, isDeleted: false },
    select: {
      id: true,
      creatorId: true,
      isTeam: true,
      maxTeamSize: true,
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

  if (!arena) return { error: "Arena not found." };
  if (arena.creatorId === userId) return { error: HOST_CANNOT_ENTER };
  if (!arena.isTeam) return { error: "This arena is solo-only." };

  const now = new Date();
  if (!teamsAreOpen(arena, now)) {
    return {
      error:
        now < arena.registrationStart
          ? "Entries have not opened yet."
          : TEAMS_LOCKED,
    };
  }

  const team = await prisma.arenaTeam.findFirst({
    // Scoped to the arena: a teamId from another arena must not resolve here.
    where: { id: teamId, arenaId },
    select: {
      id: true,
      name: true,
      joinPolicy: true,
      _count: { select: { members: true } },
    },
  });

  if (!team) return { error: "That team is not in this arena." };

  if (team.joinPolicy === "INVITE_ONLY") {
    return { error: `${team.name} is invite only. Ask them for a seat.` };
  }
  if (team._count.members >= arena.maxTeamSize) {
    return { error: `${team.name} is full.` };
  }

  const existingMembership = await prisma.arenaTeamMember.findFirst({
    where: { userId, team: { arenaId } },
    select: { teamId: true },
  });

  if (existingMembership) {
    return existingMembership.teamId === teamId
      ? { success: true, teamId }
      : { error: "You are already on a team in this arena. Leave it first." };
  }

  /**
   * The solo entry is withdrawn in the same transaction. Someone who entered
   * alone and then joined a team would otherwise hold two entries - counted
   * twice against `maxParticipants`, and listed both in a team card and under
   * "looking for a team".
   */
  await prisma.$transaction(async (tx) => {
    await tx.arenaTeamMember.create({
      data: { teamId, userId, isLeader: false, joinedAt: now },
    });
    await tx.arenaEntry.updateMany({
      where: { arenaId, userId, withdrawnAt: null },
      data: { withdrawnAt: now },
    });
  });

  return { success: true, teamId };
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

  if (arena.creatorId === leaderUserId) {
    return { error: HOST_CANNOT_ENTER };
  }

  if (!arena.isTeam) {
    return { error: "This arena is solo-only and does not permit teams." };
  }

  const now = new Date();
  if (!teamsAreOpen(arena, now)) {
    return {
      error:
        now < arena.registrationStart ? "Entries have not opened yet." : TEAMS_LOCKED,
    };
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
        // The arena's default. A leader may change it afterwards only where
        // `allowLeaderAccessControl` says so.
        joinPolicy: arena.defaultTeamJoinPolicy,
        members: {
          create: {
            userId: leaderUserId,
            // Whoever starts a team leads it. Nothing else would make sense
            // at the moment a team is one person.
            isLeader: true,
            joinedAt: now,
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

    // A founder who had already entered alone holds a solo entry too. Left
    // standing it counts twice against `maxParticipants` and lists them both
    // in their own team and under "looking for a team".
    await tx.arenaEntry.updateMany({
      where: { arenaId, userId: leaderUserId, withdrawnAt: null },
      data: { withdrawnAt: new Date() },
    });

    return { success: true, teamId: team.id };
  });
}
