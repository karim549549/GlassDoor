import "server-only";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import type { ArenaFormOutput, ArenaListQuery } from "./schema";
import {
  ARENA_LIST_SELECT,
  ARENA_DETAIL_INCLUDE,
  type ArenaListItem,
  type ArenaDetail,
  type ArenaDetailMeta,
} from "./types";

export { ARENA_LIST_SELECT, ARENA_DETAIL_INCLUDE };

export interface ListArenasParams extends ArenaListQuery {
  userId?: string | null;
}

export interface ListArenasResult {
  arenas: ArenaListItem[];
  total: number;
  totalPages: number;
}

export async function listArenas(params: ListArenasParams): Promise<ListArenasResult> {
  const { page, limit, status, access, search, sortBy, tab, userId, tag } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ArenaWhereInput = {};

  if (tab === "my") {
    if (!userId) {
      throw new Error("listArenas: tab='my' requires a userId.");
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

  if (tag && tag.trim()) {
    where.tags = {
      some: {
        tag: {
          OR: [
            { slug: tag.toLowerCase() },
            { name: { equals: tag, mode: "insensitive" } },
          ],
        },
      },
    };
  }

  if (search.trim()) {
    const searchConditions: Prisma.ArenaWhereInput[] = [
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

  let orderBy: Prisma.ArenaOrderByWithRelationInput = { registrationStart: "desc" };
  if (sortBy === "oldest") {
    orderBy = { registrationStart: "asc" };
  } else if (sortBy === "title") {
    orderBy = { title: "asc" };
  } else if (sortBy === "teams") {
    orderBy = { teams: { _count: "desc" } };
  }

  const [arenas, total] = await Promise.all([
    prisma.arena.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: ARENA_LIST_SELECT,
    }),
    prisma.arena.count({ where }),
  ]);

  return {
    arenas,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getArenaDetail(
  uuid: string,
  currentUserId: string | null
): Promise<{ arena: ArenaDetail; meta: ArenaDetailMeta } | null> {
  const arena = await prisma.arena.findUnique({
    where: { id: uuid },
    include: ARENA_DETAIL_INCLUDE,
  });

  if (!arena) {
    return null;
  }

  const isOwner = currentUserId ? arena.creatorId === currentUserId : false;
  const isRegistered = currentUserId
    ? arena.teams.some((team) => team.members.some((member) => member.userId === currentUserId))
    : false;
  const totalParticipants = arena.teams.reduce((sum, team) => sum + team.members.length, 0);

  return {
    arena,
    meta: { isOwner, isRegistered, totalParticipants },
  };
}

export type CreateArenaResult = { id: string } | { error: string };

export async function createArena(
  data: ArenaFormOutput & { creatorId: string }
): Promise<CreateArenaResult> {
  if (data.isPrivate && data.inviteCode) {
    const existing = await prisma.arena.findUnique({
      where: { inviteCode: data.inviteCode },
    });
    if (existing) {
      return { error: "This invitation code is already in use by another arena." };
    }
  }

  // Connect tags safely if provided
  let tagCreateInput: Prisma.TagOnArenaCreateNestedManyWithoutArenaInput | undefined;
  if (data.tags && data.tags.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: {
        OR: [
          { id: { in: data.tags } },
          { name: { in: data.tags } },
          { slug: { in: data.tags } },
        ],
      },
      select: { id: true },
    });

    if (existingTags.length > 0) {
      tagCreateInput = {
        create: existingTags.map((t) => ({
          tag: {
            connect: { id: t.id },
          },
        })),
      };
    }
  }

  const arena = await prisma.arena.create({
    data: {
      title: data.title,
      description: data.description,
      coverImageUrl: data.coverImageUrl || null,
      locationType: data.locationType,
      locationName: data.locationType === "IN_PERSON" ? data.locationName || null : null,
      googleMapsUrl: data.locationType === "IN_PERSON" ? data.googleMapsUrl || null : null,
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
      allowLeaderAccessControl: data.isTeam ? data.allowLeaderAccessControl ?? true : null,
      requireGithubUrl: data.requireGithubUrl,
      requireFigmaUrl: data.requireFigmaUrl,
      requireVideoUrl: data.requireVideoUrl,
      requireWriteup: data.requireWriteup,
      rulesText: data.rulesText,
      creatorId: data.creatorId,
      status: "REGISTRATION_OPEN",
      tags: tagCreateInput,
    },
  });

  return { id: arena.id };
}

/** Fetches all available tags with total count of associated arenas. */
export async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      category: true,
      description: true,
      _count: {
        select: { arenas: true },
      },
    },
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    color: t.color || "golden",
    category: t.category || "General",
    description: t.description || "",
    count: t._count.arenas,
  }));
}

/**
 * Placeholder hook for RAG (Retrieval-Augmented Generation) & AI Tag Extraction.
 * On-the-fly analyzes arena title and description to auto-suggest relevant tags.
 */
export async function extractAndSuggestTags(title: string, description: string) {
  const allTags = await getAllTags();
  const textContent = `${title} ${description}`.toLowerCase();

  // Keyword match ranking for auto-suggestions
  const suggestedTags = allTags.filter((tag) =>
    textContent.includes(tag.name.toLowerCase()) || textContent.includes(tag.slug.toLowerCase())
  );

  return suggestedTags;
}
