import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { submitJudgeVerdict } from "@/lib/arena/judging-service";

const scoreSchema = z.object({
  assignmentId: z.string().uuid(),
  scores: z.array(
    z.object({
      criterionId: z.string().uuid(),
      score: z.number().min(0),
      justification: z.string().min(5, "Justification must be at least 5 characters"),
    })
  ).min(1, "At least one criterion score is required"),
  feedbackText: z.string().optional().nullable(),
});

export async function POST(
  request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  return withApiErrorHandling(
    "Judge score submission API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const limit = checkRateLimit(`judge-score:${user.id}`, {
        limit: 30,
        windowMs: 60_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const body = await request.json();
      const parsed = scoreSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await submitJudgeVerdict({
        ...parsed.data,
        judgeUserId: user.id,
      });

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        verdictId: result.verdictId,
        finalScore: result.finalScore,
      });
    },
    "Failed to submit judge verdict."
  );
}
