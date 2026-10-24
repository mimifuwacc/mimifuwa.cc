import { defineConfig } from "void/config";

const isDev = process.env.MIMIFUWA_CC_DEPLOY_ENV === "dev";

export default defineConfig({
  inference: {
    appType: "void",
  },
  cloudflare: {
    name: isDev ? "mimifuwa-cc-dev" : "mimifuwa-cc",
    routes: [
      {
        pattern: isDev ? "web-dev.mimifuwa.cc" : "mimifuwa.cc",
        custom_domain: true,
      },
    ],
    r2_buckets: [
      {
        binding: "STORAGE",
        bucket_name: isDev ? "mimifuwa-cc-content-dev" : "mimifuwa-cc-content",
      },
    ],
  },
});
