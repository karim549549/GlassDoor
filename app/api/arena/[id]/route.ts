import { NextResponse, type NextRequest } from "next/server";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { getArenaDetail } from "@/lib/arena/service";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling("Arena detail API error", async () => {
    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

    // Optionally get the authenticated user (not required — public page)
    const user = await getOptionalUser();

    const result = await getArenaDetail(uuid, user?.id ?? null);

    if (!result) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  });
}
