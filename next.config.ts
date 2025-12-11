import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Comment out static export for now due to Prisma compatibility
  // output: 'export', // Export as a static application for PWA
  images: {
    unoptimized: true // For static exports
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  }
};

export default nextConfig;
