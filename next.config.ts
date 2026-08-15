import type { NextConfig } from "next";

/**
 * This app previously sent no security headers at all.
 *
 * The CSP ships as Report-Only deliberately. Next injects inline bootstrap
 * scripts, this app renders an inline <script type="application/ld+json">
 * block, and GSAP is used throughout - so a strict script-src would break the
 * page today. Report-Only surfaces the real violation set first; promote the
 * key to "Content-Security-Policy" (and drop 'unsafe-inline' in favour of a
 * nonce) once the reports are quiet.
 *
 * Referrer-Policy is not boilerplate here: this app's auth URLs carry `code`
 * and `redirectTo` in the query string, and the browser default would leak
 * those to any third-party asset on the page.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kchzipajxxryeicyekso.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    // /login, /signup, /forgot-password are intentionally modal-over-home UX:
    // AuthModal reads the pathname/searchParams and renders the right form while
    // the actual page served is always "/". This is not a bug - the URL is
    // cosmetic so these routes are linkable/shareable/bookmarkable.
    return [
      {
        source: "/login",
        destination: "/",
      },
      {
        source: "/signup",
        destination: "/",
      },
      {
        source: "/forgot-password",
        destination: "/",
      },
      {
        source: "/user/:id/edit",
        destination: "/user/:id",
      },
    ];
  },
};

export default nextConfig;
