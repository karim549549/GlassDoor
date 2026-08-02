import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/arena/service";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function GET() {
  return withApiErrorHandling("GET /api/arena/tags", async () => {
    const tags = await getAllTags();
    return NextResponse.json({ tags });
  }, "Failed to fetch arena tags.");
}
