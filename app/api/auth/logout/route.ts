import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to sign out." }, { status: 500 });
  }
}
