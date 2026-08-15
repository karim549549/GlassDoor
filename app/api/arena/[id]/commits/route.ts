import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import {
  syncSubmissionCommits,
  getSubmissionCommits,
  type CommitSyncFailure,
} from "@/lib/arena/commit-sync";

const syncSchema = z.object({
  /**
   * Only a judge reviewing someone else's entry supplies this. It is checked
   * against the database in `findSubmissionForActor` - it grants nothing on
   * its own.
   */
  submissionId: z.string().uuid().optional().nullable(),
});

const FAILURE_STATUS: Record<CommitSyncFailure, number> = {
  NO_SUBMISSION: 404,
  FORBIDDEN: 403,
  WRONG_PHASE: 400,
  INVALID_GITHUB_URL: 400,
  REPO_NOT_FOUND: 400,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  NO_COMMITS: 400,
};

/**
 * Pulls the submission's commit history from GitHub and persists it.
 *
 * Auth: session user must be the solo entrant, a member of the entry's team,
 * or a judge assigned to this submission.
 * Phase: IMPLEMENTATION_PHASE, UNDER_JUDGING or COMPLETED.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena commit sync API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      // Hard limit: every call fans out into up to 15 outbound requests against
      // a third-party API whose unauthenticated quota is 60/hour for the whole
      // deployment. This is the one route where a loose limit takes the feature
      // offline for every other entrant, not just the abuser.
      const limit = checkRateLimit(`commit-sync:${user.id}`, {
        limit: 5,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: arenaId } = await context.params;

      let body: unknown = {};
      try {
        body = await request.json();
      } catch {
        // An empty body is the normal entrant case ("sync my own repo").
      }

      const parsed = syncSchema.safeParse(body ?? {});
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await syncSubmissionCommits({
        arenaId,
        userId: user.id,
        submissionId: parsed.data.submissionId,
      });

      if (!result.ok) {
        const status = FAILURE_STATUS[result.reason];
        const headers =
          result.reason === "RATE_LIMITED" && result.retryAfterSeconds
            ? { "Retry-After": String(result.retryAfterSeconds) }
            : undefined;
        return NextResponse.json({ error: result.error, reason: result.reason }, { status, headers });
      }

      return NextResponse.json({
        success: true,
        submissionId: result.submissionId,
        repo: result.repo,
        commitsSynced: result.commitsSynced,
        truncated: result.truncated,
        ...result.summary,
      });
    },
    "Failed to sync commit history.",
    request
  );
}

/**
 * Reads the already-persisted history. No outbound call.
 *
 * Auth: entrant, assigned judge, or the arena host.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena commit history fetch error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const { id: arenaId } = await context.params;
      const submissionId = request.nextUrl.searchParams.get("submissionId");

      const result = await getSubmissionCommits({
        arenaId,
        userId: user.id,
        submissionId,
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.error, reason: result.reason },
          { status: FAILURE_STATUS[result.reason] }
        );
      }

      return NextResponse.json({
        submissionId: result.submissionId,
        role: result.role,
        summary: result.summary,
        commits: result.commits,
      });
    },
    "Failed to fetch commit history."
  );
}
