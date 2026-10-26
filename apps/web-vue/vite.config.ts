import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { voidPlugin } from "void";
import { defineConfig } from "vite-plus";
import { createContentBuild } from "./src/content-build";

const appDir = dirname(fileURLToPath(import.meta.url));
const contentDir =
  process.env.CONTENT_DIR ?? resolve(appDir, "../../packages/content-dev/articles");
export default defineConfig(({ command }) => ({
  define: {
    __MIMIFUWA_CC_DEPLOY_ENV__: JSON.stringify(process.env.MIMIFUWA_CC_DEPLOY_ENV ?? "production"),
  },
  plugins: [
    createContentBuild({ contentDir, outDir: resolve(appDir, "dist") }),
    ...(command === "serve" ? [] : [voidPlugin()]),
    vue(),
  ],
}));
