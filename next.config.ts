import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "boqqnkwveliwzpxqzaha.supabase.co",
      },
    ],
  },
};

export default nextConfig;
