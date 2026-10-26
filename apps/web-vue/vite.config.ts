import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { oxContent } from "@ox-content/vite-plugin";
import { voidPlugin } from "void";
import { defineConfig } from "vite-plus";
import { contentDevApi } from "./src/content-dev-api";

const appDir = dirname(fileURLToPath(import.meta.url));
const contentDir =
  process.env.CONTENT_DIR ?? resolve(appDir, "../../packages/content-dev/articles");
export default defineConfig({
  define: {
    __MIMIFUWA_CC_DEPLOY_ENV__: JSON.stringify(process.env.MIMIFUWA_CC_DEPLOY_ENV ?? "production"),
  },
  resolve: {
    alias: {
      "@": resolve(appDir, "src"),
    },
  },
  plugins: [
    oxContent({
      srcDir: contentDir,
      ssg: false,
      search: false,
      docs: false,
      ogViewer: false,
      highlight: true,
      gfm: true,
      collections: {
        blogs: { source: "blogs/**/*", include: ["html"] },
        works: { source: "works/**/*", include: ["html"] },
      },
    }),
    contentDevApi(),
    ...(process.env.NODE_ENV === "production" ? [voidPlugin()] : []),
    vue(),
  ],
});
