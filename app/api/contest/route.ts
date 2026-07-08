import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { contestSchema, contestListQuerySchema } from "@/lib/contest/schema";
import { listContests, createContest } from "@/lib/contest/service";

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
    const parsed = contestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // 4. Create Contest database record
    const result = await createContest({ ...parsed.data, creatorId: user.id });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Contest creation API error:", error);
    return NextResponse.json({ error: "An unexpected database error occurred." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = contestListQuerySchema.safeParse(Object.fromEntries(searchParams));
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

    const { contests, total, totalPages } = await listContests({ ...query, userId });

    return NextResponse.json({
      contests,
      total,
      totalPages,
      currentPage: query.page,
    });
  } catch (error) {
    console.error("Contest fetch API error:", error);
    return NextResponse.json({ error: "Failed to fetch contests." }, { status: 500 });
  }
}
