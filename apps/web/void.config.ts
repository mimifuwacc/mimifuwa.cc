import { defineConfig } from "void/config";

const deploymentEnv = process.env.DEPLOY_ENV;

export default defineConfig({
  ...(deploymentEnv === "dev"
    ? { cloudflare: { name: "mimifuwa-cc-dev", workers_dev: true } }
    : {}),
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
    redirects: {
      "/on-repeat/": { to: "/onrepeat/", status: 301 },
      "/links": { to: "/mutuals/", status: 301 },
    },
    revalidate: {
      "/": 300,
      "/blogs/*": 300,
      "/works/*": 300,
      "/onrepeat/*": 86400,
      "/mutuals/*": 86400,
    },
  },
});
