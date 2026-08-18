import "server-only";
import { createAdminClient } from "@/lib/server/supabase/admin";
import { createClient } from "@/lib/server/supabase/server";
import { logger } from "@/lib/server/logger";

/**
 * A fixed code that skips the inbox during local development.
 *
 * Supabase's built-in mail service allows roughly two messages an hour, so
 * testing a signup flow against it means waiting - and waiting again for every
 * resend. This trades that for a code you already know.
 *
 * It is a backdoor, so it is fenced three ways and every fence is independent:
 *
 *   1. NODE_ENV !== "production". `next build` sets this, so a production
 *      bundle cannot take this path however the environment is configured.
 *   2. VERCEL_ENV !== "production". Belt and braces for the deployed case.
 *   3. DEV_OTP_CODE must be explicitly set. There is no default value, so
 *      forgetting to configure it fails closed rather than opening a guessable
 *      code like "111111" on whatever machine runs next.
 *
 * All three must hold. Losing any one of them closes the door.
 */
function devCode(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.VERCEL_ENV === "production") return null;
  const code = process.env.DEV_OTP_CODE;
  return code && code.length > 0 ? code : null;
}

export function isDevOtpCode(code: string): boolean {
  const configured = devCode();
  return configured !== null && code === configured;
}

type DevSignInResult =
  | { ok: true; user: { id: string; email: string | null; fullName: string | null } }
  | { ok: false; reason: string };

/**
 * Establish a real session for `email` without an emailed code.
 *
 * Deliberately does NOT forge a session. It asks the admin API to generate a
 * genuine magic-link OTP - `generateLink` mints one without sending mail,
 * which is what it exists for - and then verifies that OTP through the same
 * public code path a real user would. So the session, its cookies and its
 * refresh semantics are identical to production; only the delivery of the code
 * is skipped.
 *
 * The address is confirmed first, because a signup that has not been confirmed
 * cannot complete a magic-link verification.
 */
export async function devSignIn(email: string): Promise<DevSignInResult> {
  const admin = createAdminClient();

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const emailOtp = link?.properties?.email_otp;
  if (linkError || !link?.user || !emailOtp) {
    return { ok: false, reason: linkError?.message ?? "No OTP returned by generateLink" };
  }

  if (!link.user.email_confirmed_at) {
    const { error: confirmError } = await admin.auth.admin.updateUserById(link.user.id, {
      email_confirm: true,
    });
    if (confirmError) {
      return { ok: false, reason: confirmError.message };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: emailOtp,
    type: "magiclink",
  });

  if (error || !data.user) {
    return { ok: false, reason: error?.message ?? "verifyOtp returned no user" };
  }

  logger.warn("DEV_OTP_CODE accepted - a session was created without an emailed code", {
    email,
  });

  return {
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      fullName: data.user.user_metadata?.full_name ?? null,
    },
  };
}
