import { NextResponse, type NextRequest } from "next/server";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { joinArenaTeam } from "@/lib/arena/participation-service";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

/**
 * Take a free seat on an existing team.
 *
 * The counterpart to `POST /api/arena/[id]/teams`, which has existed since
 * teams did and could only ever create one with its founder in it. Nothing in
 * the codebase added a second member, so every team arena was a set of
 * one-person teams by construction.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  return withApiErrorHandling(
    "Arena join team API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-team-join:${user.id}`, {
        limit: 20,
        windowMs: 60_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: slugParam, teamId } = await context.params;
      const arenaId = extractUuidFromSlug(decodeURIComponent(slugParam));
      if (!arenaId) {
        return NextResponse.json({ error: "Arena not found." }, { status: 404 });
      }

      const result = await joinArenaTeam(arenaId, teamId, user.id);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, teamId: result.teamId });
    },
    "Could not join that team.",
    request
  );
}
