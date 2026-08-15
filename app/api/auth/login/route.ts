import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { syncUser } from "@/lib/server/auth/auth-service";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Login API error",
    async () => {
      const limit = checkRateLimit(clientKey(request, "login"), { limit: 10, windowMs: 60_000 });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
      }

      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        // Uniform message on purpose. signInWithPassword returns the same
        // "Invalid login credentials" for a wrong email and a wrong password,
        // but returns a distinct "Email not confirmed" for a registered-but-
        // unconfirmed address - which tells an unauthenticated caller that the
        // account exists. On a salary-transparency site that is the same
        // privacy leak the signup route was just fixed for, so the real reason
        // is logged server-side instead of returned.
        logger.warn("Login rejected", { reason: error?.message ?? "no user returned" });
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      // Synchronize user profile into public DB on login. If this fails, the user is
      // authenticated with Supabase but has no profile row - surface that as a real
      // error instead of silently returning success (see auth-service.ts for the sync logic).
      try {
        await syncUser({
          id: data.user.id,
          email: data.user.email ?? "",
          fullName: data.user.user_metadata?.full_name || null,
          roleName: "USER",
          emailVerified: true,
          // Safe here: signInWithPassword just returned a verified session, so
          // this id is a genuine Supabase identity rather than the throwaway id
          // signUp returns for an already-registered address.
          allowStaleEmailReconciliation: true,
        });
      } catch (syncError) {
        logger.error("Profile sync failed on login", {
          userId: data.user.id,
          error: syncError instanceof Error ? syncError.message : String(syncError),
        });
        return NextResponse.json(
          { error: "PROFILE_SYNC_FAILED" },
          { status: 500 }
        );
      }

      // The session lives only in the httpOnly cookies the Supabase server
      // client just set. Never return the refresh token in the body: the client
      // stored it in localStorage, which turned any XSS into a permanent,
      // password-less account takeover.
      return NextResponse.json({
        success: true,
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
