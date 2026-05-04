import type { NextConfig } from "next";

type NextConfigWithEslint = NextConfig & {
  eslint?: { ignoreDuringBuilds?: boolean };
  images?: {
    unoptimized?: boolean;
  };
};

const nextConfig: NextConfigWithEslint = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // allow all external images (disables optimization)
    unoptimized: true,
  },
};

export default nextConfig;
