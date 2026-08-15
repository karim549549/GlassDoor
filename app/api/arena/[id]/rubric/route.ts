import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import prisma from "@/lib/server/prisma";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { createRubric, publishRubric, getPublishedRubric } from "@/lib/arena/rubric-service";
import { requireUser, getOptionalUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const criterionSchema = z.object({
  title: z.string().trim().min(3, "Criterion title is too short").max(120),
  description: z.string().trim().min(20, "Describe what a high and a low score look like"),
  weight: z.coerce.number().positive().max(10).optional(),
  maxScore: z.coerce.number().positive().max(100).optional(),
});

const createRubricSchema = z.object({
  criteria: z.array(criterionSchema).min(1, "Add at least one domain-specific criterion"),
  publish: z.boolean().default(false),
});

const publishSchema = z.object({ rubricId: z.uuid() });

/**
 * Explicit discriminated union: an inferred one widens `error` to
 * `NextResponse | undefined`, which then leaks `undefined` into the handler's
 * return type.
 */
type HostCheck = { ok: true; arenaId: string } | { ok: false; response: NextResponse };

/** Resolves the arena and asserts the caller hosts it. */
async function requireHost(slugParam: string, userId: string): Promise<HostCheck> {
  const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
  if (!uuid) return { ok: false, response: NextResponse.json({ error: "Arena not found." }, { status: 404 }) };

  const arena = await prisma.arena.findUnique({
    where: { id: uuid },
    select: { id: true, creatorId: true },
  });
  if (!arena) return { ok: false, response: NextResponse.json({ error: "Arena not found." }, { status: 404 }) };
  if (arena.creatorId !== userId) {
    // 404 rather than 403: a non-host has no business learning that an arena
    // exists but is someone else's to configure.
    return { ok: false, response: NextResponse.json({ error: "Arena not found." }, { status: 404 }) };
  }
  return { ok: true, arenaId: arena.id };
}

/** The published rubric entrants and judges are held to. Public by design. */
export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling("Rubric fetch failed", async () => {
    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
    if (!uuid) return NextResponse.json({ error: "Arena not found." }, { status: 404 });

    await getOptionalUser();
    const rubric = await getPublishedRubric(uuid);

    // Not an error: an arena legitimately has no frozen rubric before judging
    // is configured. Callers render "not published yet" rather than failing.
    return NextResponse.json({ rubric: rubric ?? null });
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling(
    "Rubric creation failed",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`rubric-write:${user.id}`, { limit: 30, windowMs: 3_600_000 });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: slugParam } = await context.params;
      const host = await requireHost(slugParam, user.id);
      if (!host.ok) return host.response;

      const parsed = createRubricSchema.safeParse(await request.json());
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        return NextResponse.json({ error: first?.message ?? "Invalid rubric." }, { status: 400 });
      }

      const result = await createRubric(host.arenaId, parsed.data.criteria, {
        publish: parsed.data.publish,
      });
      if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

      return NextResponse.json({ success: true, rubric: result.rubric });
    },
    "Could not create the rubric.",
    request
  );
}

/** Freezes a draft rubric version. Irreversible. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling(
    "Rubric publish failed",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`rubric-write:${user.id}`, { limit: 30, windowMs: 3_600_000 });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: slugParam } = await context.params;
      const host = await requireHost(slugParam, user.id);
      if (!host.ok) return host.response;

      const parsed = publishSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "A rubric id is required." }, { status: 400 });
      }

      // Scope the rubric to THIS arena so a host cannot publish someone else's.
      const owned = await prisma.rubric.findFirst({
        where: { id: parsed.data.rubricId, arenaId: host.arenaId },
        select: { id: true },
      });
      if (!owned) return NextResponse.json({ error: "Rubric not found." }, { status: 404 });

      const result = await publishRubric(parsed.data.rubricId);
      if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

      return NextResponse.json({ success: true });
    },
    "Could not publish the rubric.",
    request
  );
}
