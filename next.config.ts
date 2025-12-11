import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Comment out static export for now due to compatibility
  // output: 'export', // Export as a static application for PWA
  images: {
    unoptimized: true // For static exports
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include server-only dependencies in client builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }

    return config;
  },
};

export default nextConfig;
