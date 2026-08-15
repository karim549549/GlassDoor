import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser, getOptionalUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import {
  getArenaRequirements,
  createArenaRequirement,
  releaseArenaRequirement,
} from "@/lib/arena/requirement-service";

const createSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Describe the change in at least 10 characters").max(5000),
  weight: z.number().min(0).max(10).optional(),
  /** ISO timestamp. Omitted creates a draft the host releases by hand. */
  releaseAt: z.string().datetime().optional().nullable(),
});

const releaseSchema = z.object({
  requirementId: z.string().uuid(),
});

/**
 * Public list of RELEASED requirements only, oldest release first.
 *
 * Auth: none required. `?includeUnreleased=true` is honoured only when the
 * session user is the arena's creator - the service resolves that from the
 * database, and the unreleased rows are excluded by the query itself for
 * everyone else. An unreleased requirement leaking here would defeat the
 * entire adaptation mechanic.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena requirements fetch error",
    async () => {
      const { id: arenaId } = await context.params;
      const includeUnreleased = request.nextUrl.searchParams.get("includeUnreleased") === "true";

      // Identity is only needed to decide whether the host view is available.
      const viewer = includeUnreleased ? await getOptionalUser() : null;

      const result = await getArenaRequirements({
        arenaId,
        viewerId: viewer?.id ?? null,
        includeUnreleased,
        now: new Date(),
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({
        isHost: result.isHost,
        requirements: result.requirements,
      });
    },
    "Failed to fetch arena requirements."
  );
}

/**
 * Creates a requirement.
 *
 * Auth: arena host only (`arena.creatorId === session user`).
 * Phase: any status except CANCELED and COMPLETED.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena requirement create API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`requirement-create:${user.id}`, {
        limit: 30,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: arenaId } = await context.params;
      const parsed = createSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await createArenaRequirement({
        arenaId,
        hostUserId: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        weight: parsed.data.weight,
        releaseAt: parsed.data.releaseAt ? new Date(parsed.data.releaseAt) : null,
        now: new Date(),
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({ success: true, requirement: result.requirement }, { status: 201 });
    },
    "Failed to create arena requirement.",
    request
  );
}

/**
 * Releases a drafted or scheduled requirement immediately - the injection.
 *
 * Auth: arena host only.
 * Phase: IMPLEMENTATION_PHASE only. Releasing before it or after submissions
 * lock gives entrants no window to adapt, and is rejected with that reason.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena requirement release API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`requirement-release:${user.id}`, {
        limit: 30,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: arenaId } = await context.params;
      const parsed = releaseSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await releaseArenaRequirement({
        arenaId,
        requirementId: parsed.data.requirementId,
        hostUserId: user.id,
        now: new Date(),
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({ success: true, requirement: result.requirement });
    },
    "Failed to release arena requirement.",
    request
  );
}
