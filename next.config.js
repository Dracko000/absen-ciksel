// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Enable in production only
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
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
  module.exports = withBundleAnalyzer(withPWA(nextConfig));
} else {
  module.exports = withPWA(nextConfig);
}