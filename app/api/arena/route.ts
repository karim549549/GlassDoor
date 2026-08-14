import { NextResponse, type NextRequest } from "next/server";
import { arenaSchema, arenaListQuerySchema } from "@/lib/arena/schema";
import { listArenas, createArena } from "@/lib/arena/service";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Arena creation API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;
      const { user } = auth;

      const body = await request.json();

      const parsed = arenaSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      try {
        const result = await createArena({ ...parsed.data, creatorId: user.id });
        if ("error" in result) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, id: result.id });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Database error during arena creation.";
        console.error("createArena DB Error:", err);
        return NextResponse.json(
          { error: errorMsg },
          { status: 500 }
        );
      }
    },
    "An unexpected error occurred during arena creation."
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

      let userId: string | null = null;
      if (query.tab === "my") {
        const auth = await requireUser();
        if ("response" in auth) return auth.response;
        userId = auth.user.id;
      }

      const { arenas, total, totalPages } = await listArenas({ ...query, userId });

      return NextResponse.json({
        arenas,
        total,
        totalPages,
        currentPage: query.page,
      });
    },
    "Failed to fetch arenas."
  );
}
