import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  allowedDevOrigins: ["localhost:3000", "192.168.1.6:3000", "192.168.1.6"]
};

export default nextConfig;
