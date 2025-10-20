import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Handle @xenova/transformers for client-side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  experimental: {
    // Disable Turbopack for now due to compatibility issues with transformers
    // turbo: false, // Commented out due to type error
  },
};

export default nextConfig;