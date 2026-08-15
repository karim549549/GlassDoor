import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // These are either per-user or pure redirect plumbing - nothing a crawler
      // should index, and /api/auth in particular must never be fetched by one.
      disallow: ["/api/", "/profile", "/arena/create"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
