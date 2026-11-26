import { defineConfig } from "void/config";

const deploymentEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env?.DEPLOY_ENV;
const nodeEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env?.NODE_ENV;
const workerName = deploymentEnv === "dev" ? "mimifuwa-cc-dev" : "mimifuwa-cc-prod";

export default defineConfig({
  cloudflare: { name: workerName, workers_dev: true },
  inference: {
    appType: "void",
    build: "vp build",
    outputDir: "dist",
  },
  head: {
    htmlAttrs: { lang: "ja" },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#ffffff" },
    ],
    link: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "preload",
        href: "/fonts/noto-sans-mono-latin-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/noto-sans-jp-118-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/noto-sans-jp-119-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/noto-sans-jp-111-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
      },
      // In development, Vize injects the layout CSS from JavaScript after the SSR HTML is visible.
      // Load the same CSS in the head so the first paint uses the site's base styles.
      ...(nodeEnv === "production"
        ? []
        : [{ rel: "stylesheet", href: "/styles/mimifuwa-cc.css?direct" }]),
    ],
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
