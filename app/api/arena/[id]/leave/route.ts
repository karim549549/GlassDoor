import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { leaveArena } from "@/lib/arena/participation-service";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena leave API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-leave:${user.id}`, {
        limit: 20,
        windowMs: 60_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: arenaId } = await context.params;
      const result = await leaveArena(arenaId, user.id);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    },
    "Failed to leave arena."
  );
}
