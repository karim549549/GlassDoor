import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { createArenaTeam } from "@/lib/arena/participation-service";

const teamCreateSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(50),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena create team API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-team:${user.id}`, {
        limit: 10,
        windowMs: 60_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: arenaId } = await context.params;
      const body = await request.json();
      const parsed = teamCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid team name.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await createArenaTeam(arenaId, user.id, parsed.data.name);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, teamId: result.teamId });
    },
    "Failed to create team."
  );
}
