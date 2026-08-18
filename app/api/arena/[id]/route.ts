import { NextResponse, type NextRequest } from "next/server";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { getArenaDetail } from "@/lib/arena/service";
import { resolveViewer, toArenaDetailDto } from "@/lib/arena/dto";
import { deriveArenaStatus } from "@/lib/arena/status";
import { getOptionalUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling("Arena detail API error", async () => {
    /**
     * Keyed by IP, not by user: this route is public, so the caller worth
     * limiting is the one who never signs in. 120/minute is far above what a
     * person browsing arenas generates and well below what enumerating uuids
     * needs to be worthwhile.
     */
    const limit = checkRateLimit(clientKey(request, "arena-detail"), {
      limit: 120,
      windowMs: 60_000,
    });
    if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
    // A slug that doesn't end in a well-formed UUID can't match anything -
    // answer 404 without touching the database.
    if (!uuid) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    // Optionally get the authenticated user (not required — public page)
    const user = await getOptionalUser();

    const result = await getArenaDetail(uuid, user?.id ?? null);

    /**
     * 404, never 403.
     *
     * `getArenaDetail` returns null for three different reasons - no such
     * arena, still a draft, or private and this caller is neither its host nor
     * an entrant - and they all answer the same way on purpose. A 403 would
     * confirm that a given uuid names a real private arena, which is exactly
     * the fact the gate exists to withhold.
     */
    if (!result) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    const { arena, meta } = result;
    const viewer = resolveViewer({
      userId: user?.id ?? null,
      creatorId: arena.creatorId,
      isRegistered: meta.isRegistered,
    });

    /**
     * Through the DTO, always.
     *
     * This route used to return the raw service result, which meant it served
     * `inviteCode` - the entire access control on a private arena - plus every
     * participant's user id, to anyone who asked. The DTO is what decides who
     * sees those; nothing here should hand back a Prisma row again.
     */
    return NextResponse.json({
      arena: toArenaDetailDto(arena, deriveArenaStatus(arena, new Date()), viewer),
      viewer: viewer.relationship,
      meta: {
        isOwner: meta.isOwner,
        isRegistered: meta.isRegistered,
        totalParticipants: meta.totalParticipants,
      },
    });
  });
}
