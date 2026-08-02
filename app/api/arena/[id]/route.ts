import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { extractUuidFromSlug } from "@/lib/arena-slug";
import { getArenaDetail } from "@/lib/arena/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: slugParam } = await context.params;
    const uuid = extractUuidFromSlug(decodeURIComponent(slugParam));

    // Optionally get the authenticated user (not required — public page)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id ?? null;

    const result = await getArenaDetail(uuid, currentUserId);

    if (!result) {
      return NextResponse.json({ error: "Arena not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Arena detail API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
