import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import {
  generateDefensePrompts,
  recordDefense,
  getDefenseState,
} from "@/lib/arena/defense-service";

/**
 * Current defense state: the snapshotted question set, the recording URL and
 * when it was taken.
 *
 * Auth: the entrant, or a judge holding an assignment for the submission
 * (`?submissionId=` - verified against the database, never trusted on its own).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena defense fetch error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const { id: arenaId } = await context.params;
      const result = await getDefenseState({
        arenaId,
        userId: user.id,
        submissionId: request.nextUrl.searchParams.get("submissionId"),
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error, reason: result.reason }, { status: result.status });
      }

      return NextResponse.json({
        submissionId: result.submissionId,
        role: result.role,
        prompts: result.prompts,
        defenseVideoUrl: result.defenseVideoUrl,
        defenseRecordedAt: result.defenseRecordedAt,
      });
    },
    "Failed to fetch defense state."
  );
}

/**
 * Two actions on one resource, selected by `?action=`:
 *
 *   ?action=generate  - derive and snapshot the question set from the
 *                       submission's synced commits (JSON body, none required).
 *   (default)         - upload the recording as multipart/form-data `file`.
 *
 * Auth (both): submission owner only. A judge can read the defense but never
 * produce one.
 * Phase (both): UNDER_JUDGING. Before the implementation phase closes the
 * question set would tell the entrant which commits to go and understand.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena defense API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const { id: arenaId } = await context.params;
      const action = request.nextUrl.searchParams.get("action");

      if (action === "generate") {
        const limit = checkRateLimit(`defense-prompts:${user.id}`, {
          limit: 20,
          windowMs: 3_600_000,
        });
        if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

        const result = await generateDefensePrompts({ arenaId, userId: user.id });
        if (!result.ok) {
          return NextResponse.json({ error: result.error, reason: result.reason }, { status: result.status });
        }

        return NextResponse.json({
          success: true,
          submissionId: result.submissionId,
          alreadyGenerated: result.alreadyGenerated,
          prompts: result.prompts,
        });
      }

      // Uploads write up to 50MB through the service-role storage client, so
      // this is limited far harder than the prompt generation above.
      const limit = checkRateLimit(`defense-record:${user.id}`, {
        limit: 5,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Missing defense recording. Send it as multipart/form-data under \"file\"." },
          { status: 400 }
        );
      }

      const result = await recordDefense({ arenaId, userId: user.id, file });
      if (!result.ok) {
        return NextResponse.json({ error: result.error, reason: result.reason }, { status: result.status });
      }

      return NextResponse.json({
        success: true,
        submissionId: result.submissionId,
        defenseVideoUrl: result.defenseVideoUrl,
        defenseRecordedAt: result.defenseRecordedAt,
        replaced: result.replaced,
        prompts: result.prompts,
      });
    },
    "Failed to record oral defense.",
    request
  );
}
