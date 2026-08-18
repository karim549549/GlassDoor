import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { resendOtpSchema } from "@/lib/auth/otp";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";
import { publicAuthError } from "@/lib/server/auth/supabase-error";

/**
 * Send a fresh code for an in-progress signup or password reset.
 *
 * Uniform response for the same reason /api/auth/signup and
 * /api/auth/reset-password are uniform: this is unauthenticated and takes an
 * arbitrary address, so any variation in what it says is a way to ask "does
 * this developer have an account here".
 */
const UNIFORM_RESPONSE = {
  success: true,
  message: "If that address needs a code, a new one is on its way.",
} as const;

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Resend OTP API error",
    async () => {
      const parsed = resendOtpSchema.safeParse(await request.json());
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        return NextResponse.json({ error: first?.message ?? "Invalid request." }, { status: 400 });
      }
      const { email, purpose } = parsed.data;

      // Sends mail to any address supplied, so without a cap this is a
      // mail-bombing tool aimed at third parties, sent from this domain. Keyed
      // on the address as well as the IP so rotating IPs cannot keep hitting
      // one inbox.
      const byAddress = checkRateLimit(`resend-otp:${email.toLowerCase()}`, {
        limit: 4,
        windowMs: 3_600_000,
      });
      if (!byAddress.ok) return rateLimitResponse(byAddress.retryAfterSeconds);

      const byIp = checkRateLimit(clientKey(request, "resend-otp-ip"), {
        limit: 10,
        windowMs: 3_600_000,
      });
      if (!byIp.ok) return rateLimitResponse(byIp.retryAfterSeconds);

      const supabase = await createClient();

      // Two different Supabase calls, because "resend the signup code" and
      // "send a recovery code" are separate token types - auth.resend() does
      // not handle recovery.
      const { error } =
        purpose === "signup"
          ? await supabase.auth.resend({ type: "signup", email })
          : await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        logger.warn("Resend rejected by Supabase", {
          purpose,
          reason: error.message,
          code: error.code,
          status: error.status,
        });

        // "Wait an hour" is the single most useful thing this endpoint can
        // say, and it is not an enumeration leak - the send cap is
        // project-wide, not per address.
        const surfaced = publicAuthError(error);
        if (surfaced) {
          return NextResponse.json({ error: surfaced.message }, { status: surfaced.status });
        }
      }

      return NextResponse.json(UNIFORM_RESPONSE);
    },
    "An unexpected error occurred.",
    request
  );
}
