import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Reset password API error",
    async () => {
      // Unauthenticated and it sends mail to any address supplied, so without a
      // cap this endpoint is a mail-bombing tool aimed at third parties, sent
      // from this domain.
      const limit = checkRateLimit(clientKey(request, "reset"), {
        limit: 3,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { email } = await request.json();

      if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
      }

      const supabase = await createClient();
      const origin = new URL(request.url).origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/api/auth/callback?redirectTo=/?action=reset-password`,
      });

      // Uniform response whether or not the address is registered, and whether
      // or not Supabase accepted the send. resetPasswordForEmail is itself
      // enumeration-safe on the happy path, but its error messages (rate
      // limits, delivery failures) leak project internals and can imply
      // account existence. Nothing here is actionable by the caller: either a
      // mail arrives or it does not.
      if (error) {
        logger.warn("Password reset rejected by Supabase", { reason: error.message });
      }

      return NextResponse.json({
        success: true,
        message: "If that address has an account, a reset link is on its way.",
      });
    },
    "An unexpected error occurred.",
    request
  );
}
