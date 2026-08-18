import { NextResponse, type NextRequest } from "next/server";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { getArenaDetail, updateArena, cancelArena } from "@/lib/arena/service";
import { resolveViewer, toArenaDetailDto } from "@/lib/arena/dto";
import { deriveArenaStatus } from "@/lib/arena/status";
import { getOptionalUser, requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { arenaSchema } from "@/lib/arena/schema";
import { resolveArenaAuthority } from "@/lib/arena/authority";
import { getUserRoles } from "@/lib/server/auth/auth-service";
import { getCompanyStanding } from "@/lib/companies/service";
import { logger } from "@/lib/server/logger";
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

    const result = await getArenaDetail({ kind: "id", id: uuid }, user?.id ?? null);

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

/**
 * Edit an arena. Host only.
 *
 * A full-object PATCH: the edit screen is the create form, so it submits every
 * field and `arenaSchema` validates it exactly as it does on POST. Partial
 * merging would mean a second validation path for one schema, and the second
 * one is always the one nobody exercises.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling(
    "Arena update API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-update:${user.id}`, {
        limit: 30,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: slugParam } = await context.params;
      const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
      if (!uuid) {
        return NextResponse.json({ error: "Arena not found." }, { status: 404 });
      }

      const body = await request.json();
      const parsed = arenaSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      /**
       * Re-derived on every edit, never carried over from the row and never
       * read from the body.
       *
       * Both would be wrong in the same direction. Trusting the body reopens
       * the exact self-assignment hole `resolveArenaAuthority` was written to
       * close - on the route nobody re-checked, because the create route had
       * already been fixed. Carrying the stored value over would keep COMPANY
       * attribution alive after the host lost the seat that justified it.
       */
      const requestedCompanyId =
        typeof body?.companyId === "string" ? body.companyId : null;

      const [roles, standing] = await Promise.all([
        getUserRoles(user.id),
        requestedCompanyId
          ? getCompanyStanding(user.id, requestedCompanyId)
          : Promise.resolve(null),
      ]);

      const decision = resolveArenaAuthority({ roles, requestedCompanyId, standing });
      if (!decision.ok) {
        logger.warn("Arena authority refused on edit", {
          userId: user.id,
          arenaId: uuid,
          requestedCompanyId,
          reason: decision.reason,
        });
        return NextResponse.json({ error: decision.reason }, { status: 403 });
      }

      const result = await updateArena(uuid, user.id, {
        ...parsed.data,
        authority: decision.authority,
        companyId: decision.companyId,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ success: true, id: result.id, slug: result.slug });
    },
    "An unexpected error occurred while saving this arena.",
    request
  );
}

/**
 * Call an arena off. Host only, and soft.
 *
 * DELETE rather than a POST to /cancel because the arena stops being a live
 * thing, which is what the verb means here - but nothing is removed. Entrants
 * who blocked out their Saturday get the page they bookmarked, saying what
 * happened.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling(
    "Arena cancel API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-cancel:${user.id}`, {
        limit: 10,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: slugParam } = await context.params;
      const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
      if (!uuid) {
        return NextResponse.json({ error: "Arena not found." }, { status: 404 });
      }

      const result = await cancelArena(uuid, user.id);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ success: true, id: result.id, slug: result.slug });
    },
    "An unexpected error occurred while calling off this arena.",
    request
  );
}
