import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { getJudgeAssignments } from "@/lib/arena/judging-service";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Judge assignments fetch error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const { id: arenaId } = await context.params;
      const assignments = await getJudgeAssignments(user.id, arenaId);

      return NextResponse.json({ assignments });
    },
    "Failed to fetch judge assignments."
  );
}
