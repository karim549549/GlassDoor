import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function POST(request: Request) {
  return withApiErrorHandling(
    "Logout API error",
    async () => {
      const supabase = await createClient();
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.json({ success: true });
    },
    "Failed to sign out.",
    request
  );
}
