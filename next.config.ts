import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
