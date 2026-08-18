import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { markEmailVerified } from "@/lib/server/auth/auth-service";
import { verifyOtpSchema } from "@/lib/auth/otp";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";
import { isDevOtpCode, devSignIn } from "@/lib/server/auth/dev-otp";

/**
 * Exchange an emailed code for a session.
 *
 * On success Supabase sets the session cookies through the server client, so
 * the caller is signed in the moment this returns - the same arrangement as
 * /api/auth/login. Nothing token-shaped is ever put in the response body.
 */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Verify OTP API error",
    async () => {
      const parsed = verifyOtpSchema.safeParse(await request.json());
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        return NextResponse.json({ error: first?.message ?? "Invalid request." }, { status: 400 });
      }
      const { email, code, purpose } = parsed.data;

      // Two buckets, both required. Six digits is a million combinations, and
      // an IP-only limit lets a botnet spread guesses across addresses while
      // an address-only limit lets one attacker rotate IPs against one target.
      // The address bucket is the tighter of the two because a legitimate
      // reader is typing a code they can see.
      const byAddress = checkRateLimit(`verify-otp:${email.toLowerCase()}`, {
        limit: 8,
        windowMs: 900_000,
      });
      if (!byAddress.ok) return rateLimitResponse(byAddress.retryAfterSeconds);

      const byIp = checkRateLimit(clientKey(request, "verify-otp-ip"), {
        limit: 30,
        windowMs: 900_000,
      });
      if (!byIp.ok) return rateLimitResponse(byIp.retryAfterSeconds);

      // Local-only shortcut past the inbox. isDevOtpCode() is false in any
      // production build, so this branch is unreachable there - see dev-otp.ts
      // for the three independent fences. It still runs behind the rate limits
      // above so the dev path cannot mask a limiter bug in the real one.
      if (isDevOtpCode(code)) {
        const bypass = await devSignIn(email);
        if (!bypass.ok) {
          logger.warn("Dev OTP sign-in failed", { reason: bypass.reason });
          return NextResponse.json(
            { error: `Dev sign-in failed: ${bypass.reason}` },
            { status: 400 }
          );
        }

        try {
          await markEmailVerified({
            id: bypass.user.id,
            email: bypass.user.email ?? email,
            fullName: bypass.user.fullName,
          });
        } catch (syncError) {
          logger.error("Profile sync failed after dev OTP sign-in", {
            userId: bypass.user.id,
            error: syncError instanceof Error ? syncError.message : String(syncError),
          });
          return NextResponse.json({ error: "PROFILE_SYNC_FAILED" }, { status: 500 });
        }

        return NextResponse.json({ success: true, purpose, user: bypass.user });
      }

      const supabase = await createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: purpose,
      });

      if (error || !data.user) {
        // Unlike login, a specific message is safe here and worth having: the
        // caller already supplied the address and is holding a code, so
        // "wrong or expired" reveals nothing about whether an account exists.
        // Telling them to request a new code is the whole difference between
        // retrying forever and getting in.
        logger.warn("OTP verification rejected", {
          purpose,
          reason: error?.message ?? "no user returned",
        });
        return NextResponse.json(
          { error: "That code is wrong or has expired. Request a new one." },
          { status: 400 }
        );
      }

      try {
        await markEmailVerified({
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: data.user.user_metadata?.full_name ?? null,
        });
      } catch (syncError) {
        // The Supabase session is already live at this point, so failing
        // silently would leave a signed-in user with no profile row - which is
        // exactly the shape of the PROFILE_SYNC_FAILED outage this codebase
        // has already been bitten by once.
        logger.error("Profile sync failed after OTP verification", {
          userId: data.user.id,
          error: syncError instanceof Error ? syncError.message : String(syncError),
        });
        return NextResponse.json({ error: "PROFILE_SYNC_FAILED" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        purpose,
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || null,
        },
      });
    },
    "An unexpected error occurred.",
    request
  );
}
