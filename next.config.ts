import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgd.aeplcdn.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
