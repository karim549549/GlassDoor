import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { createOrUpdateSubmission, getEntrantSubmission } from "@/lib/arena/submission-service";

const submissionSchema = z.object({
  githubUrl: z.string().min(1, "GitHub repository URL is required").url("Must be a valid URL"),
  figmaUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  videoUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  writeupText: z.string().min(20, "Technical writeup must be at least 20 characters"),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena submission API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`arena-submit:${user.id}`, {
        limit: 10,
        windowMs: 60_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { id: arenaId } = await context.params;
      const body = await request.json();

      const parsed = submissionSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await createOrUpdateSubmission(arenaId, user.id, parsed.data);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        submissionId: result.submissionId,
        revisionNumber: result.revisionNumber,
      });
    },
    "Failed to submit deliverables."
  );
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Arena submission fetch error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const { id: arenaId } = await context.params;
      const submission = await getEntrantSubmission(arenaId, user.id);

      return NextResponse.json({ submission });
    },
    "Failed to fetch submission."
  );
}
