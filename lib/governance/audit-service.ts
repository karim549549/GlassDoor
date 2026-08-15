import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/server/prisma";

/**
 * Append-only audit trail.
 *
 * This module deliberately exposes **no update and no delete**. `AuditLog` rows
 * are written once and never touched again — that is the entire property that
 * makes the table worth anything. If a correction is needed, write a second row
 * describing the correction; do not add an `updateAudit` here.
 *
 * The load-bearing caller is recruiter contact export: under Egypt's PDPL
 * (Law 151/2020) a bulk export of developer personal data has to be
 * attributable after the fact, and without a row here "who exported what,
 * when" is unanswerable.
 */

/** Canonical action verbs. Kept here so call sites can't drift on spelling. */
export const AUDIT_ACTIONS = {
  RECRUITER_EXPORT_CONTACTS: "recruiter.export_contacts",
  DISPUTE_RESOLVED: "moderation.dispute_resolved",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export interface RecordAuditInput {
  /** Null only for genuinely unattributable system actions (cron, migration). */
  actorId: string | null;
  action: AuditAction | string;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

/**
 * Writes one audit row.
 *
 * This intentionally does **not** swallow its errors. A caller that exports
 * personal data must fail closed: if the row cannot be written, the export must
 * not happen, because an unattributable export is precisely what this table
 * exists to prevent. Callers should `await recordAudit(...)` *before* returning
 * the exported payload.
 */
export async function recordAudit(input: RecordAuditInput): Promise<string> {
  const row = await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? undefined,
      ipAddress: input.ipAddress ?? null,
    },
    select: { id: true },
  });
  return row.id;
}

/**
 * Leftmost `x-forwarded-for` entry — the originating client. Same parsing as
 * `clientKey` in lib/server/rate-limit.ts, but returns null rather than the
 * string "unknown" when the header is absent, so an absent IP is stored as SQL
 * NULL instead of a value that looks like a real one.
 */
export function auditIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}

export interface ListAuditParams {
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  page: number;
  pageSize: number;
}

/**
 * Read side, for an admin/compliance view. Read-only by construction — there is
 * no mutating counterpart in this module.
 */
export async function listAudit(params: ListAuditParams) {
  const where: Prisma.AuditLogWhereInput = {
    ...(params.actorId ? { actorId: params.actorId } : {}),
    ...(params.action ? { action: params.action } : {}),
    ...(params.targetType ? { targetType: params.targetType } : {}),
    ...(params.targetId ? { targetId: params.targetId } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { entries, total, totalPages: Math.max(1, Math.ceil(total / params.pageSize)) };
}
