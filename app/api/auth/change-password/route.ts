import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password failed:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
