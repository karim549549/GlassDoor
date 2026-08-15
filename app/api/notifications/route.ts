import { NextResponse, type NextRequest } from "next/server";
import { notificationListQuerySchema, notificationMarkReadSchema } from "@/lib/governance/schema";
import { listForUser, markAllRead, markRead } from "@/lib/governance/notification-service";
import { toNotificationDto } from "@/lib/governance/dto";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

/**
 * A user's own inbox, and nothing else.
 *
 * There is no `userId` parameter on either handler by design. The owner is
 * always `user.id` from the session; a query-string user id here would be a
 * one-line IDOR that exposes every user's notifications, including the ones
 * that name arenas and actors they have no other way to see.
 */
export async function GET(request: NextRequest) {
  return withApiErrorHandling(
    "Notification list API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const { searchParams } = new URL(request.url);
      const parsed = notificationListQuerySchema.safeParse(Object.fromEntries(searchParams));
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid query parameters.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await listForUser({ userId: user.id, ...parsed.data });

      return NextResponse.json({
        notifications: result.notifications.map(toNotificationDto),
        total: result.total,
        totalPages: result.totalPages,
        unreadCount: result.unreadCount,
        currentPage: parsed.data.page,
      });
    },
    "Failed to fetch notifications."
  );
}

export async function PATCH(request: NextRequest) {
  return withApiErrorHandling(
    "Notification mark-read API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      // Keyed on the authenticated user: this is a cheap write, but an open
      // updateMany endpoint is still worth a ceiling.
      const limit = checkRateLimit(`notifications-read:${user.id}`, {
        limit: 120,
        windowMs: 60_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const body = await request.json();
      const parsed = notificationMarkReadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      // Both service calls scope the update by userId, so ids belonging to
      // someone else simply match nothing.
      const updated = parsed.data.all
        ? await markAllRead(user.id)
        : await markRead(user.id, parsed.data.ids ?? []);

      return NextResponse.json({ success: true, updated });
    },
    "Failed to update notifications.",
    request
  );
}
