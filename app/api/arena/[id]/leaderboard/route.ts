import { NextResponse, type NextRequest } from "next/server";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { getArenaLeaderboard } from "@/lib/arena/leaderboard-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling("Arena leaderboard API error", async () => {
    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
    if (!uuid) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    const leaderboard = await getArenaLeaderboard(uuid);
    if (!leaderboard) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    return NextResponse.json(leaderboard);
  });
}
