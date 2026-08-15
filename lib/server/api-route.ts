import "server-only";
import { NextResponse } from "next/server";
import { logger } from "@/lib/server/logger";

/**
 * Supabase's SSR cookies are SameSite=Lax, which already blocks a cross-site
 * POST from carrying the session - so this app was protected from CSRF by a
 * library default it never declared a dependency on. One cookie-config change
 * would have silently removed that protection with nothing to catch it.
 *
 * This makes the requirement explicit. `Sec-Fetch-Site` is sent by every
 * current browser and is not settable by page script; the Origin/Host
 * comparison is the fallback for clients that omit it.
 *
 * "none" is allowed because it means a user-initiated navigation (typed URL,
 * bookmark), not a cross-site request.
 */
function isSameOriginMutation(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return true;
  }

  const site = request.headers.get("sec-fetch-site");
  if (site) {
    return site === "same-origin" || site === "none";
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  // A non-browser caller (curl, a server-to-server client) sends neither
  // header. Those cannot be victims of CSRF - there is no ambient cookie to
  // ride - so they are not blocked here; the route's own requireUser() gate
  // still applies.
  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * The try { ... } catch (err) { console.error(label, err); return
 * NextResponse.json({error}, {status:500}) } wrapper every route handler
 * repeated. `label` is what gets logged (kept per-route so error logs stay
 * specific), `errorMessage` is what the caller sees (defaults to a generic
 * message; pass a route-specific one where it existed before).
 *
 * Only the unhandled-exception path logs. A route returning its own 4xx
 * (validation failure, not-found, etc.) from inside `fn` never reaches this
 * catch — that's normal control flow, not something to log.
 *
 * Pass `request` on any non-GET route to also enforce the same-origin check
 * above. It is optional only so that GET-only routes need not thread it
 * through; every mutation route should pass it.
 */
export async function withApiErrorHandling(
  label: string,
  fn: () => Promise<NextResponse>,
  errorMessage = "Internal server error.",
  request?: Request
): Promise<NextResponse> {
  if (request && !isSameOriginMutation(request)) {
    logger.warn("Cross-origin mutation rejected", {
      label,
      origin: request.headers.get("origin") ?? "none",
    });
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    return await fn();
  } catch (err) {
    logger.error(label, { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
