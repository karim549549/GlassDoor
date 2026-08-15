import { NextResponse, type NextRequest } from "next/server";
import { pipelineExportSchema, pipelineQuerySchema } from "@/lib/recruiter/schema";
import {
  getPipelineMemberships,
  getRecruiterPipeline,
  resolveAuthorizedCompanyIds,
} from "@/lib/recruiter/pipeline-service";
import { toPipelineCsv, toPipelineResponseDto } from "@/lib/recruiter/dto";
import { AUDIT_ACTIONS, auditIpFromRequest, recordAudit } from "@/lib/governance/audit-service";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";

/**
 * The paying customer's read surface.
 *
 * The authorization rule this route exists to enforce: a `companyId` in the
 * query string or body is NEVER the authorization input. The caller's
 * memberships are resolved from the database against the session user id, and
 * an incoming companyId is only intersected with that set. Trusting the
 * client's companyId here would hand one company another company's entire
 * candidate pipeline.
 */
export async function GET(request: NextRequest) {
  return withApiErrorHandling(
    "Recruiter pipeline API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`recruiter-pipeline:${user.id}`, {
        limit: 120,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { searchParams } = new URL(request.url);
      const parsed = pipelineQuerySchema.safeParse(Object.fromEntries(searchParams));
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid query parameters.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const memberships = await getPipelineMemberships(user.id);
      const companyIds = resolveAuthorizedCompanyIds(memberships, parsed.data.companyId);
      if (!companyIds) {
        logger.warn("Recruiter pipeline access denied", {
          userId: user.id,
          requestedCompanyId: parsed.data.companyId ?? "none",
        });
        return NextResponse.json(
          { error: "Forbidden. You are not a recruiter, admin or owner of that company." },
          { status: 403 }
        );
      }

      const result = await getRecruiterPipeline(companyIds, {
        domain: parsed.data.domain,
        minRating: parsed.data.minRating,
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
      });

      return NextResponse.json(toPipelineResponseDto(result, parsed.data.page));
    },
    "Failed to fetch the candidate pipeline."
  );
}

/**
 * Export.
 *
 * A POST rather than a GET query flag on purpose: an export is a recorded
 * event, not a cacheable read, and routing it through POST gives it the
 * same-origin check and rate limit that `withApiErrorHandling(..., request)`
 * enforces for mutations.
 *
 * The audit row is written **before** the payload is returned and its failure
 * is not swallowed — an export that cannot be attributed does not happen. That
 * ordering is the whole PDPL (Law 151/2020) argument: "who exported what, when"
 * has to be answerable after the fact.
 */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Recruiter pipeline export API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`recruiter-export:${user.id}`, {
        limit: 20,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const body = await request.json();
      const parsed = pipelineExportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const memberships = await getPipelineMemberships(user.id);
      const companyIds = resolveAuthorizedCompanyIds(memberships, parsed.data.companyId);
      if (!companyIds) {
        logger.warn("Recruiter pipeline export denied", {
          userId: user.id,
          requestedCompanyId: parsed.data.companyId ?? "none",
        });
        return NextResponse.json(
          { error: "Forbidden. You are not a recruiter, admin or owner of that company." },
          { status: 403 }
        );
      }

      const result = await getRecruiterPipeline(companyIds, {
        domain: parsed.data.domain,
        minRating: parsed.data.minRating,
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
      });

      const dto = toPipelineResponseDto(result, parsed.data.page);

      await recordAudit({
        actorId: user.id,
        action: AUDIT_ACTIONS.RECRUITER_EXPORT_CONTACTS,
        targetType: "companies",
        targetId: companyIds.join(","),
        metadata: {
          rowCount: dto.candidates.length,
          exportedUserIds: dto.candidates.map((c) => c.userId),
          filters: {
            domain: parsed.data.domain ?? null,
            minRating: parsed.data.minRating ?? null,
            page: parsed.data.page,
            pageSize: parsed.data.pageSize,
          },
          contactDetailsIncluded: false,
          contactWithheldReason: dto.contactWithheldReason,
        },
        ipAddress: auditIpFromRequest(request),
      });

      const csv = toPipelineCsv(dto.candidates);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="devs-arena-pipeline-${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    },
    "Failed to export the candidate pipeline.",
    request
  );
}
