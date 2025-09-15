// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// don't load opennext config on Vercel
if (process.env.VERCEL !== "1") {
  try {
    const { initOpenNextCloudflareForDev } = await import(
      "@opennextjs/cloudflare"
    );
    initOpenNextCloudflareForDev();
  } catch (_error) {
    console.info("Cloudflare integration skipped");
  }
}
