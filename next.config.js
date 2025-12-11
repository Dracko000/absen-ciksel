/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Comment out static export for now due to compatibility
  // output: 'export', // Export as a static application for PWA
  images: {
    unoptimized: false, // Enable image optimization
    // Using remotePatterns instead of domains for better security
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-domain.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Enable modern image formats
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

// Enable bundle analyzer in production builds
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}