import prisma from "@/lib/server/prisma";
import ContestsListClient from "./ContestsListClient";
import { Prisma } from "@prisma/client";

type ContestWithTeamsAndMembers = Prisma.ContestGetPayload<{
  include: {
    teams: {
      include: {
        members: true;
      };
    };
  };
}>;

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  // Fetch contests from the database with a graceful fallback to mock data
  let dbContests: ContestWithTeamsAndMembers[] = [];
  try {
    dbContests = await prisma.contest.findMany({
      include: {
        teams: {
          include: {
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database query failed (possibly unmigrated schema). Falling back to mock data.", error);
  }

  // Map dates to ISO strings for client-side serialization
  const formattedDbContests = dbContests.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    coverImageUrl: c.coverImageUrl,
    status: c.status,
    isPrivate: c.isPrivate,
    isTeam: c.isTeam,
    minTeamSize: c.minTeamSize,
    maxTeamSize: c.maxTeamSize,
    maxParticipants: c.maxParticipants,
    registrationStart: c.registrationStart.toISOString(),
    registrationEnd: c.registrationEnd.toISOString(),
    ideaPhaseStart: c.ideaPhaseStart.toISOString(),
    ideaPhaseEnd: c.ideaPhaseEnd.toISOString(),
    implPhaseStart: c.implPhaseStart.toISOString(),
    implPhaseEnd: c.implPhaseEnd.toISOString(),
    requireGithubUrl: c.requireGithubUrl,
    requireFigmaUrl: c.requireFigmaUrl,
    requireVideoUrl: c.requireVideoUrl,
    requireWriteup: c.requireWriteup,
    rulesText: c.rulesText,
    creatorId: c.creatorId,
    teams: c.teams.map((t) => ({
      id: t.id,
      members: t.members.map((m) => ({
        userId: m.userId,
      })),
    })),
  }));

  return <ContestsListClient initialContests={formattedDbContests} />;
}
