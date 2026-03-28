import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  outputFileTracingExcludes: {
    "/api/bulk-send": ["./public/**/*"],
  },
};

export default nextConfig;
