import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { profileSchema } from "@/lib/profile/schema";
import { updateUserProfile } from "@/lib/profile/service";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.json();
    const parsed = profileSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid request body." },
        { status: 400 }
      );
    }

    const result = await updateUserProfile(user.id, parsed.data);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error("Profile update failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
