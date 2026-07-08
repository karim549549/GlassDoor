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
  // Fetch contests from the database with initial page 1 (50 limit)
  let dbContests: ContestWithTeamsAndMembers[] = [];
  let totalCount = 0;
  try {
    const [contests, count] = await Promise.all([
      prisma.contest.findMany({
        take: 50,
        include: {
          teams: {
            include: {
              members: true,
            },
          },
        },
        orderBy: { registrationStart: "desc" },
      }),
      prisma.contest.count()
    ]);
    dbContests = contests;
    totalCount = count;
  } catch (error) {
    console.error("Database query failed.", error);
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

  const initialTotalPages = Math.ceil(totalCount / 50);

  return (
    <ContestsListClient 
      initialContests={formattedDbContests} 
      initialTotalPages={initialTotalPages}
      initialTotalCount={totalCount}
    />
  );
}
