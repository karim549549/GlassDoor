import { safeRedirectPath } from "@/lib/url";

/**
 * Where a freshly authenticated reader lands.
 *
 * One function rather than the same expression inlined in the login form, the
 * verification form and the OAuth callback - they had already drifted.
 *
 * The board, not the profile. Signing in used to land on /user/<id>, which is
 * the page other people read to evaluate you: it answers nothing about what to
 * do next. The arena list is the one surface where there is always something
 * to do, and it is where a returning entrant is going anyway.
 *
 * `userId` is still taken because the signed-in home may become a per-user
 * route later; when it does, this is the only line that changes.
 *
 * `redirectTo` is run through safeRedirectPath so a crafted ?redirectTo=
 * cannot bounce someone off-site straight after sign-in.
 */
export function authLandingPath(userId: string, redirectTo?: string | null): string {
  void userId;
  return safeRedirectPath(redirectTo ?? "", "/arena");
}
