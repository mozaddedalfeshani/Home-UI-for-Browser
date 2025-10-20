import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true
  },
  experimental: {
    // Disable Turbopack for now due to compatibility issues with transformers
    // turbo: false, // Commented out due to type error
  },
};

export default nextConfig;