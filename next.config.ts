import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.thesimpsonsapi.com",
        pathname: "/500/character/**",
      },
    ],
  },
};

export default nextConfig;
