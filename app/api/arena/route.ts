import { NextResponse, type NextRequest } from "next/server";
import { arenaSchema, arenaListQuerySchema } from "@/lib/arena/schema";
import { listArenas, createArena } from "@/lib/arena/service";
import { requireUser, getOptionalUser } from "@/lib/server/auth/require-user";
import { getUserRoles } from "@/lib/server/auth/auth-service";
import { getCompanyStanding } from "@/lib/companies/service";
import { resolveArenaAuthority } from "@/lib/arena/authority";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Arena creation API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      // Keyed on the authenticated user rather than the IP: arena creation is
      // a heavy write (tag resolution + insert) and an authenticated id can't
      // be spoofed the way a forwarded IP can. The upload route this pairs
      // with was already limited; this one was not.
      const limit = checkRateLimit(`arena-create:${user.id}`, {
        limit: 10,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const body = await request.json();

      const parsed = arenaSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      // Authority is decided here, from who is asking - never taken from the
      // body. It used to be a validated field on the payload, which meant any
      // logged-in caller could POST `authority: "OFFICIAL"` and receive the
      // tier PRD 7.1 reserves for platform admins, with full XP and cash-prize
      // eligibility attached. `companyId` had the same shape: nothing checked
      // that the caller belonged to the company they were publishing under.
      //
      // The requested company id is still read from the body - a host has to
      // be able to say which of their companies this is for - but it only
      // survives if the membership behind it does.
      const requestedCompanyId =
        typeof body?.companyId === "string" ? body.companyId : null;

      const [roles, standing] = await Promise.all([
        getUserRoles(user.id),
        requestedCompanyId ? getCompanyStanding(user.id, requestedCompanyId) : Promise.resolve(null),
      ]);

      const decision = resolveArenaAuthority({ roles, requestedCompanyId, standing });
      if (!decision.ok) {
        logger.warn("Arena authority refused", {
          userId: user.id,
          requestedCompanyId,
          reason: decision.reason,
        });
        return NextResponse.json({ error: decision.reason }, { status: 403 });
      }

      const result = await createArena({
        ...parsed.data,
        creatorId: user.id,
        authority: decision.authority,
        companyId: decision.companyId,
      });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, id: result.id });
    },
    "An unexpected error occurred during arena creation.",
    request
  );
}

export async function GET(request: NextRequest) {
  return withApiErrorHandling(
    "Arena fetch API error",
    async () => {
      const { searchParams } = new URL(request.url);
      const parsed = arenaListQuerySchema.safeParse(Object.fromEntries(searchParams));
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid query parameters.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const query = parsed.data;

      // The viewer is optional for the public list, but is needed even on the
      // "all" tab so the response can carry an accurate "My Arenas" count.
      const viewer = await getOptionalUser();
      if (query.tab === "my" && !viewer) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      const { arenas, total, totalPages, myCount } = await listArenas({
        ...query,
        userId: viewer?.id ?? null,
      });

      return NextResponse.json({
        arenas,
        total,
        totalPages,
        myCount,
        currentPage: query.page,
      });
    },
    "Failed to fetch arenas."
  );
}
