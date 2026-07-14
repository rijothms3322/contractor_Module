import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  allowedDevOrigins: ["localhost:3000", "localhost:3001", "192.168.1.4:3000", "192.168.1.4:3001", "192.168.1.4"]
};

export default nextConfig;
