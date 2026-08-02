import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { getUserProfileById } from "@/lib/user/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Optionally get the viewer (not required — public profile page)
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    const profile = await getUserProfileById(id, viewer?.id ?? null);

    if (!profile) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("User profile API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
