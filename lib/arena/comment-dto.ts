import { z } from "zod";
import type { RawArenaComment } from "./comment-service";

export const arenaCommentAuthorDtoSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable(),
  handle: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export type ArenaCommentAuthorDto = z.infer<typeof arenaCommentAuthorDtoSchema>;

export interface ArenaCommentDto {
  id: string;
  /** Empty string for a tombstone — a removed comment withholds its text. */
  content: string;
  isPinned: boolean;
  isAnonymous: boolean;
  isDeleted: boolean;
  createdAt: Date;
  /** Null when the comment is anonymous or removed. Never a partial author. */
  author: ArenaCommentAuthorDto | null;
  replies: ArenaCommentDto[];
}

const arenaCommentDtoSchema: z.ZodType<ArenaCommentDto> = z.lazy(() =>
  z.object({
    id: z.string(),
    content: z.string(),
    isPinned: z.boolean(),
    isAnonymous: z.boolean(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    author: arenaCommentAuthorDtoSchema.nullable(),
    replies: z.array(arenaCommentDtoSchema),
  })
);

export { arenaCommentDtoSchema };

/**
 * The anonymity guarantee.
 *
 * The public node is CONSTRUCTED FIELD BY FIELD — never spread from the raw
 * row — so an identity can only appear in a response if this function writes it
 * there explicitly, and it writes it only when `isAnonymous` is false and the
 * comment is not a tombstone. There is no author id, name, handle or avatar
 * anywhere in the anonymous branch, so no consumer can re-identify the author
 * regardless of how carelessly it renders the node. Because every read path
 * goes through this transform, that holds for the API, the arena page, and
 * anything built on them later.
 */
function toNode(raw: RawArenaComment): ArenaCommentDto {
  const isDeleted = raw.deletedAt !== null;
  const isIdentityWithheld = raw.isAnonymous || isDeleted;

  return {
    id: raw.id,
    content: isDeleted ? "" : raw.content,
    isPinned: raw.isPinned,
    isAnonymous: raw.isAnonymous,
    isDeleted,
    createdAt: raw.createdAt,
    author: isIdentityWithheld
      ? null
      : {
          id: raw.author.id,
          fullName: raw.author.fullName,
          handle: raw.author.handle,
          avatarUrl: raw.author.avatarUrl,
        },
    replies: [],
  };
}

/**
 * Assembles the flat list from `listArenaComments` into a reply tree in one
 * pass over a lookup map — no recursion into the database, no depth cap.
 *
 * A reply whose parent is missing from the batch is promoted to a root rather
 * than dropped, so an unexpected gap costs the thread its indentation, not the
 * comment. Roots come back pinned-first; within each group the `createdAt asc`
 * order the service queried is preserved by the stable sort.
 */
export function toArenaCommentTree(rows: RawArenaComment[]): ArenaCommentDto[] {
  const nodes = new Map<string, ArenaCommentDto>();
  for (const row of rows) {
    nodes.set(row.id, toNode(row));
  }

  const roots: ArenaCommentDto[] = [];
  for (const row of rows) {
    const node = nodes.get(row.id);
    if (!node) continue;
    const parent = row.parentId ? nodes.get(row.parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  roots.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  return z.array(arenaCommentDtoSchema).parse(roots);
}

/** Single-comment variant, used by the POST response. */
export function toArenaCommentDto(raw: RawArenaComment): ArenaCommentDto {
  return arenaCommentDtoSchema.parse(toNode(raw));
}
