import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export', // Export as a static application for PWA
  images: {
    unoptimized: true // For static exports
  }
};

export default nextConfig;
