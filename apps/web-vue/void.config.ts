import { defineConfig } from "void/config";

const deploymentEnv = process.env.MIMIFUWA_CC_DEPLOY_ENV;

export default defineConfig({
  ...(deploymentEnv === "dev"
    ? { cloudflare: { name: "mimifuwa-cc-dev", workers_dev: true } }
    : {}),
  inference: {
    appType: "void",
    outputDir: "dist",
  },
});
