import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { listArenaComments, createArenaComment } from "@/lib/arena/comment-service";
import { toArenaCommentTree, toArenaCommentDto } from "@/lib/arena/comment-dto";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "A comment needs at least 2 characters.")
    .max(4000, "A comment cannot exceed 4000 characters."),
  parentId: z.string().uuid().optional().nullable(),
  isAnonymous: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling("Arena comments API error", async () => {
    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
    if (!uuid) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    const rows = await listArenaComments(uuid);
    return NextResponse.json({ comments: toArenaCommentTree(rows) });
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrorHandling(
    "Arena comment creation API error",
    async () => {
      const { id: slugParam } = await context.params;
      const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));
      if (!uuid) {
        return NextResponse.json({ error: "Arena not found." }, { status: 404 });
      }

      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-comment:${user.id}`, {
        limit: 20,
        windowMs: 60 * 60 * 1000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const body = await request.json();
      const parsed = createCommentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await createArenaComment({
        arenaId: uuid,
        authorId: user.id,
        content: parsed.data.content,
        parentId: parsed.data.parentId,
        isAnonymous: parsed.data.isAnonymous,
      });

      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(
        { comment: toArenaCommentDto(result.comment) },
        { status: 201 }
      );
    },
    "Failed to post comment.",
    request
  );
}
