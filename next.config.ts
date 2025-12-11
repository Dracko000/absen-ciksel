import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Comment out static export for now due to compatibility
  // output: 'export', // Export as a static application for PWA
  images: {
    unoptimized: true // For static exports
  },
};

export default nextConfig;
