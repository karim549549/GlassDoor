import "server-only";
import { NextResponse } from "next/server";
import { logger } from "@/lib/server/logger";

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
 */
export async function withApiErrorHandling(
  label: string,
  fn: () => Promise<NextResponse>,
  errorMessage = "Internal server error."
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    logger.error(label, { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
