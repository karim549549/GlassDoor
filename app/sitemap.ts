import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { buildArenaSlug } from "@/lib/arena-slug";
import { listArenas } from "@/lib/arena/service";
import { listCompanySlugs } from "@/lib/companies/service";
import { logger } from "@/lib/server/logger";

/**
 * app/robots.ts has always advertised /sitemap.xml; until now that URL 404'd.
 *
 * Rendered per request rather than at build time: it reads the database, and a
 * build must not depend on the database being reachable.
 */
export const dynamic = "force-dynamic";

/**
 * Only routes that actually resolve. /profile and /arena/create are excluded
 * because app/robots.ts already disallows them, and there is no /companies
 * index page - companies are reachable only at /companies/[slug].
 */
const STATIC_PATHS = ["", "/arena", "/billboard"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [{ arenas }, companies] = await Promise.all([
      // access: "public" is load-bearing, not a default. A private arena is
      // reachable only through its invite code, so listing one here would
      // publish that existence to every crawler - the sitemap is the one place
      // in this app where an over-broad query is a disclosure, not just noise.
      listArenas({
        page: 1,
        limit: 100,
        status: "all",
        access: "public",
        sortBy: "newest",
        tab: "all",
        search: "",
        userId: null,
      }),
      listCompanySlugs(),
    ]);

    for (const company of companies) {
      entries.push({
        url: `${siteUrl}/companies/${company.slug}`,
        lastModified: company.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const arena of arenas) {
      entries.push({
        url: `${siteUrl}/arena/${buildArenaSlug(arena.title, arena.id)}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch (err) {
    // A sitemap listing only the static routes is a far better failure than a
    // 500 that tells crawlers the whole site is broken.
    logger.error("Sitemap generation failed to load dynamic routes", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return entries;
}
