import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@hugeicons/react", "@hugeicons/core-free-icons"],
};

export default nextConfig;
