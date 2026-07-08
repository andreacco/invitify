import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // Aumentamos la tubería a 25MB
    },
  },
};

export default nextConfig;