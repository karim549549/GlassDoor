import { NextResponse, type NextRequest } from "next/server";
import {
  disputeCreateSchema,
  disputeListQuerySchema,
  disputeResolveSchema,
} from "@/lib/governance/schema";
import { createDispute, listDisputes, resolveDispute } from "@/lib/governance/dispute-service";
import { toDisputeDto } from "@/lib/governance/dto";
import { auditIpFromRequest } from "@/lib/governance/audit-service";
import { requireRole, requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

/**
 * Raise a dispute.
 *
 * This is an abuse-report surface, which makes it itself abusable: a report
 * costs the reporter nothing and costs the reported party moderator attention.
 * Hence a deliberately tight per-user ceiling on top of the auth requirement —
 * an anonymous report endpoint was never an option here.
 */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Dispute creation API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`dispute-create:${user.id}`, {
        limit: 10,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const body = await request.json();
      const parsed = disputeCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const dispute = await createDispute({ ...parsed.data, reporterId: user.id });
      return NextResponse.json({ success: true, dispute: toDisputeDto(dispute) }, { status: 201 });
    },
    "Failed to raise the dispute.",
    request
  );
}

/**
 * The moderator queue, plus one narrow self-service case.
 *
 * `scope=all` requires the ADMIN platform role. `scope=mine` requires only a
 * session and is pinned to the caller's own `reporterId` — a reporter may see
 * their own disputes and nobody else's. There is no parameter that lets a
 * caller name a different reporter.
 */
export async function GET(request: NextRequest) {
  return withApiErrorHandling(
    "Dispute list API error",
    async () => {
      const { searchParams } = new URL(request.url);
      const parsed = disputeListQuerySchema.safeParse(Object.fromEntries(searchParams));
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid query parameters.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const { scope, ...listParams } = parsed.data;

      if (scope === "mine") {
        const auth = await requireUser();
        if ("response" in auth) return auth.response;
        const result = await listDisputes({ ...listParams, reporterId: auth.user.id });
        return NextResponse.json({
          disputes: result.disputes.map(toDisputeDto),
          total: result.total,
          totalPages: result.totalPages,
          currentPage: listParams.page,
        });
      }

      const auth = await requireRole(["ADMIN"]);
      if ("response" in auth) return auth.response;

      const result = await listDisputes(listParams);
      return NextResponse.json({
        disputes: result.disputes.map(toDisputeDto),
        total: result.total,
        totalPages: result.totalPages,
        currentPage: listParams.page,
      });
    },
    "Failed to fetch disputes."
  );
}

/** Moderator resolution. Writes an audit row through the service. */
export async function PATCH(request: NextRequest) {
  return withApiErrorHandling(
    "Dispute resolution API error",
    async () => {
      const auth = await requireRole(["ADMIN"]);
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`dispute-resolve:${user.id}`, {
        limit: 120,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const body = await request.json();
      const parsed = disputeResolveSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await resolveDispute({
        ...parsed.data,
        resolvedById: user.id,
        ipAddress: auditIpFromRequest(request),
      });

      if ("error" in result) {
        return NextResponse.json(
          { error: "Dispute not found, or it has already been resolved." },
          { status: 409 }
        );
      }

      return NextResponse.json({ success: true, dispute: toDisputeDto(result.dispute) });
    },
    "Failed to resolve the dispute.",
    request
  );
}
