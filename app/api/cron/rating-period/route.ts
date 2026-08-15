import { NextResponse, type NextRequest } from "next/server";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { processRatingPeriod } from "@/lib/rating/rating-service";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Rating period calculation error",
    async () => {
      const authHeader = request.headers.get("authorization");
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      // Calculate current week / period index
      const epoch = new Date("2026-01-01T00:00:00Z").getTime();
      const currentPeriod = Math.max(1, Math.floor((Date.now() - epoch) / (1000 * 60 * 60 * 24 * 7)));

      const result = await processRatingPeriod(currentPeriod);
      return NextResponse.json(result);
    },
    "Failed to process rating period."
  );
}
