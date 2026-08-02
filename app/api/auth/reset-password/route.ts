import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Reset password API error",
    async () => {
      const { email } = await request.json();

      if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
      }

      const supabase = await createClient();
      const origin = new URL(request.url).origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/api/auth/callback?redirectTo=/?action=reset-password`,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Password reset link sent to your email." });
    },
    "An unexpected error occurred."
  );
}
