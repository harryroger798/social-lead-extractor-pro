import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Language routes - site uses client-side i18n, not route-based
      { source: '/en', destination: '/', permanent: true },
      { source: '/hi', destination: '/', permanent: true },
      { source: '/ta', destination: '/', permanent: true },
      { source: '/te', destination: '/', permanent: true },
      { source: '/bn', destination: '/', permanent: true },
      { source: '/mr', destination: '/', permanent: true },
      { source: '/gu', destination: '/', permanent: true },
      { source: '/kn', destination: '/', permanent: true },
      { source: '/ml', destination: '/', permanent: true },
      { source: '/pa', destination: '/', permanent: true },
      // Horoscope yearly index - redirect to horoscope hub
      { source: '/horoscope/yearly', destination: '/horoscope', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
    // Disable image optimization for local images to prevent 400 errors on low-memory servers
    unoptimized: true,
  },
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable experimental optimizations
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: ['lucide-react', 'date-fns', '@radix-ui/react-accordion', '@radix-ui/react-tabs'],
  },
};

export default nextConfig;
