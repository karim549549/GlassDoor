import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/server/supabase/server";
import { syncUser } from "@/lib/server/auth/auth-service";
import { isHandleAvailable } from "@/lib/user/service";
import { signupSchema } from "@/lib/auth/schema";
import { withApiErrorHandling } from "@/lib/server/api-route";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";
import { publicAuthError } from "@/lib/server/auth/supabase-error";
import { devOtpActive, devCreateConfirmedUser } from "@/lib/server/auth/dev-otp";

/**
 * Deliberately uniform: every outcome below - new account, address already
 * registered, Supabase rejection - returns the same success-shaped body.
 * Revealing whether an address has an account leaks which developers are on
 * the platform, and this endpoint is unauthenticated.
 */
const UNIFORM_RESPONSE = {
  success: true,
  message: "Check your email for a confirmation code.",
} as const;

export async function POST(request: NextRequest) {
  return withApiErrorHandling(
    "Signup API error",
    async () => {
      const limit = checkRateLimit(clientKey(request, "signup"), {
        limit: 5,
        windowMs: 3_600_000,
      });
      if (!limit.ok) return rateLimitResponse(limit.retryAfterSeconds);

      // roleName is validated against SELF_ASSIGNABLE_ROLES, not taken on trust:
      // it used to be destructured straight from the body and handed to
      // syncUser(), whose signature accepts "ADMIN".
      const parsed = signupSchema.safeParse(await request.json());
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        return NextResponse.json({ error: first?.message ?? "Invalid request." }, { status: 400 });
      }
      const { email, password, fullName, handle, roleName } = parsed.data;

      // Checked before Supabase is touched, so a taken handle does not leave
      // an orphaned auth user behind whose profile sync can never succeed.
      // Not a guarantee - the unique index is - but it covers the common case
      // with a message the reader can act on. A handle being taken says
      // nothing about email addresses, so this is not the enumeration surface
      // the uniform response below exists to close.
      if (!(await isHandleAvailable(handle))) {
        return NextResponse.json(
          { error: "That handle is taken. Try another." },
          { status: 409 }
        );
      }

      // With DEV_OTP_CODE set, skip Supabase's mail entirely. signUp() sends
      // a confirmation email, and the built-in service allows roughly two an
      // hour - so past that cap the account was never created and the fixed
      // code had nothing to sign in to. The dev bypass has to cover account
      // creation as well or it only solves half of its own problem.
      if (devOtpActive()) {
        const created = await devCreateConfirmedUser({ email, password, fullName });

        if (!created.ok) {
          // Most often "email address already registered". Uniform, as ever -
          // the reason is logged, not returned.
          logger.warn("Dev signup rejected", { reason: created.reason });
          return NextResponse.json({ ...UNIFORM_RESPONSE, devBypass: true });
        }

        await syncUser({
          id: created.user.id,
          email: created.user.email ?? email,
          fullName,
          handle,
          roleName,
          emailVerified: true,
        });

        return NextResponse.json({ ...UNIFORM_RESPONSE, devBypass: true });
      }

      const supabase = await createClient();
      const origin = new URL(request.url).origin;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/api/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        logger.warn("Signup rejected by Supabase", {
          reason: error.message,
          code: error.code,
          status: error.status,
        });

        // Surfacing error.message wholesale would re-open the oracle the
        // Prisma pre-check used to be: signUp answers an existing address with
        // "User already registered". publicAuthError only lets through
        // failures that carry no account-existence information - a rejected
        // address, the mail send cap - and returns null for everything else,
        // which falls through to the uniform body below.
        const surfaced = publicAuthError(error);
        if (surfaced) {
          return NextResponse.json({ error: surfaced.message }, { status: surfaced.status });
        }

        return NextResponse.json({ ...UNIFORM_RESPONSE, devBypass: devOtpActive() });
      }

      // An empty `identities` array is how Supabase reports "this address is
      // already registered" without saying so - the accompanying user object
      // carries a throwaway id. Syncing that id would make syncUser() hit the
      // email-unique constraint and take its stale-row branch, deleting the
      // real account's profile and roles.
      const isExistingAccount = data.user?.identities?.length === 0;

      if (data.user && !isExistingAccount) {
        await syncUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName,
          handle,
          roleName,
          emailVerified: false,
        });
      }

      return NextResponse.json({ ...UNIFORM_RESPONSE, devBypass: devOtpActive() });
    },
    "An unexpected error occurred.",
    request
  );
}
