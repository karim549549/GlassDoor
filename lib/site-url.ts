/**
 * The app's canonical public origin, for absolute URLs that must NOT be derived
 * from the incoming request (sitemap, robots, OG tags, canonical links).
 *
 * Deriving these from the `Host` header is what made the former
 * lib/server/api-client.ts a request-forgery primitive: `Host` is
 * client-controlled, so a crafted request could make the server emit - or call
 * out to - an attacker's origin, in that case while carrying the victim's
 * session cookie. A canonical URL read from configuration cannot be influenced
 * by a caller.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL  - set this in production; it is the only value that
 *     stays correct behind a custom domain.
 *  2. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL - Vercel-provided, correct for
 *     preview deployments where no custom domain exists.
 *  3. localhost - development only.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  return "http://localhost:3000";
}
