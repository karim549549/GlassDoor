import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { respondToInvitation } from "@/lib/arena/invitation-service";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const respondSchema = z.object({
  /**
   * The verb, not a status string. "accept" is what the button says; letting
   * the client post "ACCEPTED" would mean the API accepts a value from the
   * enum it is meant to be deciding, and the day a fourth status appears the
   * route starts honouring it for free.
   */
  action: z.enum(["accept", "decline"]),
});

/**
 * Answer an invitation. Invitee only.
 *
 * Lives at /api/invitations rather than under the arena, because the person
 * answering may not be allowed to read the arena at all yet - a private arena
 * they have been invited to is exactly the case, and requiring the arena route
 * first would mean the invitation could not be answered without the access it
 * exists to grant.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling(
    "Invitation response error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`invitation-respond:${user.id}`, {
        limit: 60,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id } = await context.params;

      const parsed = respondSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Accept or decline." }, { status: 400 });
      }

      const result = await respondToInvitation({
        invitationId: id,
        userId: user.id,
        accept: parsed.data.action === "accept",
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({ success: true, ...result.data });
    },
    "Could not answer that invitation.",
    request
  );
}
