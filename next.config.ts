import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
