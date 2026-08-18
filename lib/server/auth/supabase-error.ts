import "server-only";

/**
 * Decide whether a Supabase auth failure is safe to show the caller.
 *
 * The signup and reset routes answer every outcome with one uniform success
 * body, so an unauthenticated caller cannot use them to ask "does this
 * developer have an account here". That property is worth keeping - but it was
 * applied to *every* failure, including ones that say nothing about account
 * existence and that the reader could actually act on.
 *
 * The cost showed up in production: a signup was rejected with `400: Email
 * address "..." is invalid`, and four more with `429: email rate limit
 * exceeded`. All five were reported to the reader as success, which sent them
 * to a code screen for an account that was never created and mail that was
 * never sent. There was nothing on that screen to tell them why.
 *
 * Returns null for anything that could imply an address is registered - those
 * stay uniform.
 */
export interface SurfacedAuthError {
  message: string;
  status: number;
}

export function publicAuthError(
  error: { code?: string; status?: number } | null | undefined
): SurfacedAuthError | null {
  if (!error) return null;

  // Project-wide send cap, not tied to the address. Supabase's built-in mail
  // service allows roughly two an hour, which is easy to hit while testing.
  if (error.status === 429 || error.code === "over_email_send_rate_limit") {
    return {
      message:
        "Too many emails have been sent from this site in the last hour. Wait a little and try again.",
      status: 429,
    };
  }

  // The address itself was refused - Gmail, for one, requires the part before
  // the @ to start with a letter. Telling the reader this reveals nothing
  // about who has an account; withholding it just looks broken.
  if (error.code === "email_address_invalid" || error.code === "validation_failed") {
    return {
      message: "That email address was rejected as invalid. Check it and try again.",
      status: 400,
    };
  }

  if (error.code === "weak_password") {
    return { message: "That password is too weak. Try a longer one.", status: 400 };
  }

  if (error.code === "signup_disabled" || error.code === "email_provider_disabled") {
    return { message: "New accounts are not open right now.", status: 403 };
  }

  return null;
}
