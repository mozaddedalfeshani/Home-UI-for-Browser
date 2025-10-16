import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Cloudflare Pages compatibility
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;