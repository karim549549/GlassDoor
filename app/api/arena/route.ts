import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { arenaSchema, arenaListQuerySchema } from "@/lib/arena/schema";
import { listArenas, createArena } from "@/lib/arena/service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user against their session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Parse request JSON body
    const body = await request.json();

    // 3. Validate request schema
    const parsed = arenaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // 4. Create Arena database record
    const result = await createArena({ ...parsed.data, creatorId: user.id });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Arena creation API error:", error);
    return NextResponse.json({ error: "An unexpected database error occurred." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized scope query." }, { status: 401 });
      }
      userId = user.id;
    }

    const { arenas, total, totalPages } = await listArenas({ ...query, userId });

    return NextResponse.json({
      arenas,
      total,
      totalPages,
      currentPage: query.page,
    });
  } catch (error) {
    console.error("Arena fetch API error:", error);
    return NextResponse.json({ error: "Failed to fetch arenas." }, { status: 500 });
  }
}
