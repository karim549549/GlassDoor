import { NextResponse, type NextRequest } from "next/server";
import { getUserProfileById } from "@/lib/user/service";
import { toUserProfileDto } from "@/lib/user/dto";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling("User profile API error", async () => {
    const { id } = await context.params;

    // Optionally get the viewer (not required — public profile page)
    const viewer = await getOptionalUser();

    const raw = await getUserProfileById(id, viewer?.id ?? null);

    if (!raw) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(toUserProfileDto(raw));
  });
}
