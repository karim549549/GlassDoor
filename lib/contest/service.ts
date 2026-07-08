import "server-only";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import type { ContestFormOutput, ContestListQuery } from "./schema";
import {
  CONTEST_LIST_SELECT,
  CONTEST_DETAIL_INCLUDE,
  type ContestListItem,
  type ContestDetail,
  type ContestDetailMeta,
} from "./types";

export { CONTEST_LIST_SELECT, CONTEST_DETAIL_INCLUDE };

export interface ListContestsParams extends ContestListQuery {
  userId?: string | null;
}

export interface ListContestsResult {
  contests: ContestListItem[];
  total: number;
  totalPages: number;
}

export async function listContests(params: ListContestsParams): Promise<ListContestsResult> {
  const { page, limit, status, access, search, sortBy, tab, userId } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ContestWhereInput = {};

  if (tab === "my") {
    if (!userId) {
      throw new Error("listContests: tab='my' requires a userId.");
    }
    where.OR = [
      { creatorId: userId },
      { teams: { some: { members: { some: { userId } } } } },
    ];
  }

  if (status === "open") {
    where.status = "REGISTRATION_OPEN";
  } else if (status === "active") {
    where.status = { in: ["IDEA_PHASE", "IMPLEMENTATION_PHASE"] };
  } else if (status === "completed") {
    where.status = "COMPLETED";
  }

  if (access === "public") {
    where.isPrivate = false;
  } else if (access === "private") {
    where.isPrivate = true;
  }

  if (search.trim()) {
    const searchConditions: Prisma.ContestWhereInput[] = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { rulesText: { contains: search, mode: "insensitive" } },
    ];

    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  let orderBy: Prisma.ContestOrderByWithRelationInput = { registrationStart: "desc" };
  if (sortBy === "oldest") {
    orderBy = { registrationStart: "asc" };
  } else if (sortBy === "title") {
    orderBy = { title: "asc" };
  } else if (sortBy === "teams") {
    orderBy = { teams: { _count: "desc" } };
  }

  const [contests, total] = await Promise.all([
    prisma.contest.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: CONTEST_LIST_SELECT,
    }),
    prisma.contest.count({ where }),
  ]);

  return {
    contests,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getContestDetail(
  uuid: string,
  currentUserId: string | null
): Promise<{ contest: ContestDetail; meta: ContestDetailMeta } | null> {
  const contest = await prisma.contest.findUnique({
    where: { id: uuid },
    include: CONTEST_DETAIL_INCLUDE,
  });

  if (!contest) {
    return null;
  }

  const isOwner = currentUserId ? contest.creatorId === currentUserId : false;
  const isRegistered = currentUserId
    ? contest.teams.some((team) => team.members.some((member) => member.userId === currentUserId))
    : false;
  const totalParticipants = contest.teams.reduce((sum, team) => sum + team.members.length, 0);

  return {
    contest,
    meta: { isOwner, isRegistered, totalParticipants },
  };
}

export type CreateContestResult = { id: string } | { error: string };

export async function createContest(
  data: ContestFormOutput & { creatorId: string }
): Promise<CreateContestResult> {
  if (data.isPrivate && data.inviteCode) {
    const existing = await prisma.contest.findUnique({
      where: { inviteCode: data.inviteCode },
    });
    if (existing) {
      return { error: "This invitation code is already in use by another arena." };
    }
  }

  const contest = await prisma.contest.create({
    data: {
      title: data.title,
      description: data.description,
      coverImageUrl: data.coverImageUrl || null,
      isPrivate: data.isPrivate,
      inviteCode: data.isPrivate ? data.inviteCode || null : null,
      registrationStart: new Date(data.registrationStart),
      registrationEnd: new Date(data.registrationEnd),
      ideaPhaseStart: new Date(data.ideaPhaseStart),
      ideaPhaseEnd: new Date(data.ideaPhaseEnd),
      implPhaseStart: new Date(data.implPhaseStart),
      implPhaseEnd: new Date(data.implPhaseEnd),
      isTeam: data.isTeam,
      minTeamSize: data.isTeam ? data.minTeamSize : 1,
      maxTeamSize: data.isTeam ? data.maxTeamSize : 1,
      maxParticipants: data.maxParticipants || null,
      requireGithubUrl: data.requireGithubUrl,
      requireFigmaUrl: data.requireFigmaUrl,
      requireVideoUrl: data.requireVideoUrl,
      requireWriteup: data.requireWriteup,
      rulesText: data.rulesText,
      creatorId: data.creatorId,
      status: "REGISTRATION_OPEN",
    },
  });

  return { id: contest.id };
}
