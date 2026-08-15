import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { joinArena } from "@/lib/arena/participation-service";

const joinSchema = z.object({
  inviteCode: z.string().optional().nullable(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena join API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-join:${user.id}`, {
        limit: 20,
        windowMs: 60_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: arenaId } = await context.params;
      let body = {};
      try {
        body = await request.json();
      } catch {
        // empty body is allowed for public arenas
      }

      const parsed = joinSchema.safeParse(body);
      const inviteCode = parsed.success ? parsed.data.inviteCode : null;

      const result = await joinArena(arenaId, user.id, inviteCode);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, entryId: result.entryId });
    },
    "Failed to join arena."
  );
}
