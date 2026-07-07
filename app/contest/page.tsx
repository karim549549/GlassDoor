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

// Pre-seeded mock data to merge with database contests for a rich layout
const MOCK_CONTESTS = [
  {
    id: "mock-contest-react-2026",
    title: "Cairo React Winter Hackathon 2026",
    description: "Egyptian React developers compete live to build high-performance web solutions in a 6-hour sprint.",
    coverImageUrl: null,
    status: "IMPLEMENTATION_PHASE",
    isPrivate: false,
    isTeam: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    maxParticipants: 50,
    registrationStart: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    registrationEnd: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    ideaPhaseStart: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    ideaPhaseEnd: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    implPhaseStart: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    implPhaseEnd: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    requireGithubUrl: true,
    requireFigmaUrl: true,
    requireVideoUrl: false,
    requireWriteup: true,
    rulesText: "Build within the time box, submit GitHub repo, Figma mockup, and text writeup.",
    creatorId: "00000000-0000-0000-0000-000000000000",
    teams: []
  },
  {
    id: "mock-contest-devops-2026",
    title: "Alexandria DevOps Speedrun",
    description: "Configure scaling load-balancers, sync replicas, and maintain high availability under massive socket traffic.",
    coverImageUrl: null,
    status: "REGISTRATION_OPEN",
    isPrivate: true,
    isTeam: false,
    minTeamSize: 1,
    maxTeamSize: 1,
    maxParticipants: 30,
    registrationStart: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    registrationEnd: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    ideaPhaseStart: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    ideaPhaseEnd: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    implPhaseStart: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    implPhaseEnd: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    requireGithubUrl: true,
    requireFigmaUrl: false,
    requireVideoUrl: true,
    requireWriteup: false,
    rulesText: "Deploy on AWS, submit repository link and demo video link.",
    creatorId: "00000000-0000-0000-0000-000000000000",
    teams: []
  },
  {
    id: "mock-contest-database-2026",
    title: "Red Sea Database Sync Sprint",
    description: "Sync 10 million relational records into Postgres tables with absolute zero downtime and transaction integrity.",
    coverImageUrl: null,
    status: "COMPLETED",
    isPrivate: false,
    isTeam: true,
    minTeamSize: 1,
    maxTeamSize: 3,
    maxParticipants: 100,
    registrationStart: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    registrationEnd: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    ideaPhaseStart: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    ideaPhaseEnd: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    implPhaseStart: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    implPhaseEnd: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    requireGithubUrl: true,
    requireFigmaUrl: false,
    requireVideoUrl: false,
    requireWriteup: true,
    rulesText: "Submit full transaction logs, code repository, and performance profiles.",
    creatorId: "00000000-0000-0000-0000-000000000000",
    teams: []
  }
];

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

  // Combine database contests with mock contests
  const initialContests = [...formattedDbContests, ...MOCK_CONTESTS];

  return <ContestsListClient initialContests={initialContests} />;
}
