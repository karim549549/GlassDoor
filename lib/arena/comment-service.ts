import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";

/**
 * The only columns the comment thread ever reads.
 *
 * `authorId` is deliberately absent. The public shape is assembled by
 * `comment-dto.ts`, which drops the author entirely for an anonymous comment —
 * but a scalar `authorId` sitting on the raw row is one careless spread away
 * from re-identifying that author, so it is never fetched in the first place.
 */
export const ARENA_COMMENT_SELECT = {
  id: true,
  parentId: true,
  content: true,
  isAnonymous: true,
  isPinned: true,
  deletedAt: true,
  createdAt: true,
  author: {
    select: { id: true, fullName: true, handle: true, avatarUrl: true },
  },
} satisfies Prisma.ArenaCommentSelect;

export type RawArenaComment = Prisma.ArenaCommentGetPayload<{
  select: typeof ARENA_COMMENT_SELECT;
}>;

/**
 * Every comment on an arena as a FLAT list, in one query.
 *
 * The tree is assembled in the DTO. A recursive Prisma `include` would cap the
 * thread at whatever depth was hardcoded, and walking replies per comment is an
 * N+1 that grows with the discussion. Soft-deleted rows are fetched, not
 * filtered: dropping a deleted parent would silently reparent or lose its
 * replies, so the DTO renders it as a tombstone instead.
 */
export async function listArenaComments(arenaId: string): Promise<RawArenaComment[]> {
  return prisma.arenaComment.findMany({
    where: { arenaId },
    select: ARENA_COMMENT_SELECT,
    orderBy: { createdAt: "asc" },
  });
}

export interface CreateArenaCommentInput {
  arenaId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  isAnonymous?: boolean;
}

export type CreateArenaCommentResult =
  | { error: string }
  | { comment: RawArenaComment };

/**
 * Posts a comment or a reply.
 *
 * The parent lookup is scoped to `arenaId`: a `parentId` naming a comment on a
 * different arena is rejected rather than threaded across arenas, which would
 * otherwise leak one arena's discussion into another's tree.
 */
export async function createArenaComment(
  input: CreateArenaCommentInput
): Promise<CreateArenaCommentResult> {
  const arena = await prisma.arena.findFirst({
    where: { id: input.arenaId, isDeleted: false },
    select: { id: true },
  });
  if (!arena) return { error: "Arena not found." };

  if (input.parentId) {
    const parent = await prisma.arenaComment.findFirst({
      where: { id: input.parentId, arenaId: input.arenaId },
      select: { id: true, deletedAt: true },
    });
    if (!parent) return { error: "The comment you are replying to does not exist on this arena." };
    if (parent.deletedAt) return { error: "You cannot reply to a removed comment." };
  }

  const comment = await prisma.arenaComment.create({
    data: {
      arenaId: input.arenaId,
      authorId: input.authorId,
      content: input.content.trim(),
      parentId: input.parentId ?? null,
      isAnonymous: input.isAnonymous ?? false,
    },
    select: ARENA_COMMENT_SELECT,
  });

  return { comment };
}
