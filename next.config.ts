// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // 画像リクエストをR2配信のAPIに転送
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: "/api/images/:path*",
      },
    ];
  },
};

export default nextConfig;

// load opennext config
import("@opennextjs/cloudflare")
  .then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  })
  .catch(() => {});
