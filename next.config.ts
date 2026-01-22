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
    ],
    // Disable image optimization for local images to prevent 400 errors on low-memory servers
    unoptimized: true,
  },
};

export default nextConfig;
