import "server-only";
import { headers } from "next/headers";

/**
 * Server Components must never import a service/prisma function directly for
 * per-request data — they call this app's own /api/* routes over HTTP, same
 * as an external client would. This keeps the boundary real today so a
 * future split into a separately-deployed backend doesn't require rewriting
 * every page.
 *
 * Reads `headers()` to forward the current request's cookies (so the target
 * route's own auth check sees the same session) and to self-target whatever
 * host served this request. This only works for pages that are already
 * per-request/dynamic — calling `headers()` opts a page out of static
 * rendering, and even dynamic-marked pages can't use this during `next build`'s
 * prerender step (no live server yet to fetch from). A statically-generated
 * or ISR page has no way to self-fetch at build time; those pages call their
 * domain's service function directly instead (see app/contest/page.tsx for
 * the reasoning) — the API route calls the same function, so there's still
 * one place the query logic lives.
 *
 * Caching is always the caller's decision — pass `cache: "no-store"` for
 * per-request data.
 */
export async function fetchInternalApi(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number | false } }
): Promise<Response> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const cookie = headersList.get("cookie");

  return fetch(`${protocol}://${host}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(cookie ? { cookie } : {}),
    },
  });
}
