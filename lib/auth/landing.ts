import { safeRedirectPath } from "@/lib/url";

/**
 * Where a freshly authenticated reader lands.
 *
 * One function rather than the same expression inlined in the login form, the
 * verification form and the OAuth callback - they had already drifted, and the
 * signed-in home is about to move to /dashboard. When it does, this is the
 * only line that changes.
 *
 * `redirectTo` is run through safeRedirectPath so a crafted ?redirectTo=
 * cannot bounce someone off-site straight after sign-in.
 */
export function authLandingPath(userId: string, redirectTo?: string | null): string {
  return safeRedirectPath(redirectTo ?? "", `/user/${userId}`);
}
