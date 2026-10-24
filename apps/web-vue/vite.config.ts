import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";
import { createContentBuild } from "./src/content-build";

const appDir = dirname(fileURLToPath(import.meta.url));
const contentDir =
  process.env.CONTENT_DIR ?? resolve(appDir, "../../../mimifuwa.cc-content/articles");
const siteStyles = readFileSync(resolve(appDir, "styles/mimifuwa-cc.css"), "utf8");

export default defineConfig({
  plugins: [
    vue(),
    createContentBuild({ contentDir, outDir: resolve(appDir, "dist"), styles: siteStyles }),
  ],
});
