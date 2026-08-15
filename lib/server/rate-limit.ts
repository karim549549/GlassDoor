import "server-only";
import { NextResponse } from "next/server";

/**
 * In-process fixed-window limiter.
 *
 * On Vercel each serverless instance keeps its own map, so the effective limit
 * is (limit x live instances) rather than a hard global cap. That is still a
 * substantial cost increase for credential stuffing or reset-email flooding,
 * but it is NOT a durable guarantee - move to Vercel KV / Upstash Redis before
 * relying on it for anything stronger than slowing an attacker down.
 *
 * Before this existed there was no limiter of any kind: login, signup, password
 * reset, and both upload routes accepted unlimited requests.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    // Cheap unbounded-growth guard: sweep expired entries only once the map is
    // already large, rather than on every single call.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

/**
 * Vercel sets x-forwarded-for; the leftmost entry is the originating client.
 * Falls back to a single shared bucket when the header is absent, which is
 * deliberately conservative - better to over-limit an unidentifiable caller
 * than to hand out an unlimited bypass by omitting the header.
 */
export function clientKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${prefix}:${ip}`;
}

/**
 * Standard 429 body + Retry-After header, so every caller responds identically
 * and the message can never drift between routes.
 *
 * Returns NextResponse rather than a bare Response deliberately: route bodies
 * run inside withApiErrorHandling, which is typed `() => Promise<NextResponse>`,
 * and NextResponse adds a `cookies` property that makes a plain Response
 * structurally non-assignable to it.
 */
export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many attempts. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
