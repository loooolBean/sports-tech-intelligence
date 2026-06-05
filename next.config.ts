import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.3.54"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "platform.theverge.com" },
      { protocol: "https", hostname: "media.wired.com" },
      { protocol: "https", hostname: "www.kitmanlabs.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
