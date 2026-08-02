import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { requireUser } from "@/lib/server/auth/require-user";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Change password API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;

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
    },
    "An unexpected error occurred."
  );
}
