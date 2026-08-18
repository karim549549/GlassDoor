import "server-only";
import { createAdminClient } from "@/lib/server/supabase/admin";
import { createClient } from "@/lib/server/supabase/server";
import { logger } from "@/lib/server/logger";
import { isDevOtpActive, matchesDevOtpCode } from "@/lib/auth/dev-otp-policy";

/**
 * A fixed code that skips the inbox.
 *
 * Supabase's built-in mail service allows roughly two messages an hour, so
 * testing a signup flow against it means waiting - and waiting again for every
 * resend. This trades that for a code that is already known.
 *
 * The fence lives in lib/auth/dev-otp-policy.ts, pure and unit-tested, because
 * it is the whole security property here and it has already failed once in
 * each direction. Read the note there before changing when this is active.
 */
export function isDevOtpCode(code: string): boolean {
  return matchesDevOtpCode(process.env, code);
}

/** Reported to the client so the verification screen can warn, visibly. */
export function devOtpActive(): boolean {
  return isDevOtpActive(process.env);
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
  // Confirming an address is an admin operation, so this path needs the
  // service role key even though nothing else about it is privileged. Surface
  // a missing or placeholder key as itself rather than letting it arrive as
  // Supabase's opaque "Invalid API key" several calls later.
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }

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

type DevCreateResult =
  | { ok: true; user: { id: string; email: string | null } }
  | { ok: false; reason: string };

/**
 * Create an already-confirmed account without sending mail.
 *
 * Without this the bypass only solved half the problem. signUp() sends a
 * confirmation email, so on the built-in mail service - roughly two an hour -
 * the account was never created at all once the cap was hit, and the fixed
 * code had nothing to sign in to. Testing the flow five times in an hour is
 * completely ordinary, and that is exactly what happened.
 *
 * admin.createUser sends nothing. The password is set here as well, so the
 * account still works through the normal password login afterwards - a user
 * created without one would be a dead end the moment the bypass is removed.
 */
export async function devCreateConfirmedUser(params: {
  email: string;
  password: string;
  fullName?: string;
}): Promise<DevCreateResult> {
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: { full_name: params.fullName },
  });

  if (error || !data.user) {
    return { ok: false, reason: error?.message ?? "createUser returned no user" };
  }

  logger.warn("DEV_OTP_CODE is set - account created pre-confirmed, no email sent", {
    email: params.email,
  });

  return { ok: true, user: { id: data.user.id, email: data.user.email ?? null } };
}
