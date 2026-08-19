import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { listInvitationsForArena, sendInvitation } from "@/lib/arena/invitation-service";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * A picked person, or a typed handle.
 *
 * Two shapes rather than one optional-everything object, so "neither was
 * supplied" is a parse failure instead of something the handler has to check.
 * The handle branch tolerates the @ someone will inevitably paste along with
 * it; the bounds match `lib/user`'s own handle rules closely enough to reject
 * junk before it reaches a query.
 */
const inviteSchema = z.union([
  z.object({ userId: z.string().uuid() }),
  z.object({ handle: z.string().trim().min(2).max(40) }),
]);

/** The roster of invitations on one arena. Host only. */
export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling("Arena invitations fetch error", async () => {
    const auth = await requireUser();
    if ("response" in auth) return auth.response;

    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
    if (!uuid) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    const result = await listInvitationsForArena(uuid, auth.user.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ invitations: result.data });
  });
}

/** Invite one person by handle. Host only. */
export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling(
    "Arena invitation send error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      /**
       * Tight, because an invitation is a notification aimed at a named
       * person. An unlimited version of this route is a way to make the
       * platform deliver harassment on someone else's behalf, and the limit is
       * the only thing standing between those two readings of the feature.
       */
      const limit = checkRateLimit(`arena-invite:${user.id}`, {
        limit: 60,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: slugParam } = await context.params;
      const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
      if (!uuid) {
        return NextResponse.json({ error: "Arena not found." }, { status: 404 });
      }

      const parsed = inviteSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Pick someone to invite." }, { status: 400 });
      }

      const result = await sendInvitation({
        arenaId: uuid,
        senderId: user.id,
        target:
          "userId" in parsed.data
            ? { kind: "id", userId: parsed.data.userId }
            : { kind: "handle", handle: parsed.data.handle },
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({ invitation: result.data }, { status: 201 });
    },
    "Could not send that invitation.",
    request
  );
}
