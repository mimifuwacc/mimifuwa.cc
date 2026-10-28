import { defineConfig } from "void/config";

const deploymentEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env?.DEPLOY_ENV;
const workerName = deploymentEnv === "dev" ? "mimifuwa-cc-dev" : "mimifuwa-cc-prod";

export default defineConfig({
  cloudflare: { name: workerName, workers_dev: true },
  inference: {
    appType: "void",
    build: "vp build",
    outputDir: "dist",
  },
  head: {
    titleTemplate: "%s | mimifuwa.cc",
    htmlAttrs: { lang: "ja" },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#ffffff" },
    ],
    link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  },
  routing: {
    revalidate: {
      "/": 300,
      "/blogs": 300,
      "/blogs/*": 300,
      "/works": 300,
      "/works/*": 300,
      "/onrepeat": 86400,
      "/onrepeat/*": 86400,
      "/mutuals": 86400,
      "/mutuals/*": 86400,
    },
  },
});
