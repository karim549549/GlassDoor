import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { requireUser } from "@/lib/server/auth/require-user";
import { changePasswordSchema } from "@/lib/auth/schema";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Change password API error",
    async () => {
      const auth = await requireUser();
      if ("response" in auth) return auth.response;

      // Keyed on the user rather than the IP: the caller is already
      // authenticated, and a user id can't be spoofed the way x-forwarded-for can.
      const limit = checkRateLimit(`change-pw:${auth.user.id}`, {
        limit: 5,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const parsed = changePasswordSchema.safeParse(await request.json());
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        return NextResponse.json({ error: first?.message ?? "Invalid request." }, { status: 400 });
      }

      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Password updated successfully." });
    },
    "An unexpected error occurred.",
    request
  );
}
