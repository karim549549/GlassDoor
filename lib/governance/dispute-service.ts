import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import type { DisputeCreateInput, DisputeListQuery, DisputeResolveInput } from "./schema";
import { AUDIT_ACTIONS, recordAudit } from "./audit-service";

/**
 * The reporter's own identity is included so a moderator queue can show who
 * raised it. The *list* select is the same for the moderator view and the
 * reporter's own view — what differs is the `where`, which is decided by the
 * route, never by a client-supplied parameter.
 */
const DISPUTE_SELECT = {
  id: true,
  category: true,
  status: true,
  detail: true,
  arenaId: true,
  submissionId: true,
  commentId: true,
  reporterId: true,
  reporter: { select: { id: true, fullName: true, handle: true } },
  resolutionNote: true,
  resolvedById: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DisputeSelect;

export type RawDispute = Prisma.DisputeGetPayload<{ select: typeof DISPUTE_SELECT }>;

export async function createDispute(
  input: DisputeCreateInput & { reporterId: string }
): Promise<RawDispute> {
  return prisma.dispute.create({
    data: {
      category: input.category,
      detail: input.detail,
      reporterId: input.reporterId,
      arenaId: input.arenaId ?? null,
      submissionId: input.submissionId ?? null,
      commentId: input.commentId ?? null,
    },
    select: DISPUTE_SELECT,
  });
}

export interface ListDisputesParams extends Omit<DisputeListQuery, "scope"> {
  /**
   * Set to restrict the result to one reporter's own disputes. The route sets
   * it from the session for `scope=mine` and leaves it undefined only after
   * `requireRole(["ADMIN"])` has passed — a client can never set it.
   */
  reporterId?: string;
}

export interface ListDisputesResult {
  disputes: RawDispute[];
  total: number;
  totalPages: number;
}

export async function listDisputes(params: ListDisputesParams): Promise<ListDisputesResult> {
  const where: Prisma.DisputeWhereInput = {
    ...(params.reporterId ? { reporterId: params.reporterId } : {}),
    ...(params.status ? { status: params.status } : {}),
  };

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: DISPUTE_SELECT,
    }),
    prisma.dispute.count({ where }),
  ]);

  return { disputes, total, totalPages: Math.max(1, Math.ceil(total / params.pageSize)) };
}

export type ResolveDisputeResult =
  | { dispute: RawDispute }
  | { error: "not_found_or_already_resolved" };

/**
 * Moderator resolution. The `resolvedAt: null` in the filter is a
 * compare-and-set: a second moderator resolving the same ticket concurrently
 * gets `not_found_or_already_resolved` instead of silently overwriting the
 * first verdict.
 *
 * Authorization lives in the route (`requireRole(["ADMIN"])`) — this function
 * assumes the caller has already been checked, and takes `resolvedById` as an
 * explicit argument rather than reading any session itself.
 */
export async function resolveDispute(
  input: DisputeResolveInput & { resolvedById: string; ipAddress?: string | null }
): Promise<ResolveDisputeResult> {
  const { count } = await prisma.dispute.updateMany({
    where: { id: input.disputeId, resolvedAt: null },
    data: {
      status: input.status,
      resolutionNote: input.resolutionNote,
      resolvedById: input.resolvedById,
      resolvedAt: new Date(),
    },
  });

  if (count === 0) return { error: "not_found_or_already_resolved" };

  const dispute = await prisma.dispute.findUniqueOrThrow({
    where: { id: input.disputeId },
    select: DISPUTE_SELECT,
  });

  // A moderation verdict on another user's report is an action on personal
  // data, so it is attributable for the same reason contact export is.
  await recordAudit({
    actorId: input.resolvedById,
    action: AUDIT_ACTIONS.DISPUTE_RESOLVED,
    targetType: "disputes",
    targetId: dispute.id,
    metadata: { status: input.status, category: dispute.category },
    ipAddress: input.ipAddress ?? null,
  });

  return { dispute };
}
