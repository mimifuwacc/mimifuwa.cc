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
};

export default nextConfig;

// load opennext config
import("@opennextjs/cloudflare")
  .then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  })
  .catch(() => {});
