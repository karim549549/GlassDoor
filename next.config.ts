import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/login",
        destination: "/",
      },
      {
        source: "/signup",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
