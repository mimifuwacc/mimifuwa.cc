import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mimifuwaccContent } from "../../packages/cli/src/vite";
import { defineConfig } from "@vizejs/vite-plugin/vite-plus";
import { voidVue } from "@void/vue/plugin";
import { voidPlugin } from "void";
import { contentDevApi } from "./src/content-dev-api";

const appDir = dirname(fileURLToPath(import.meta.url));
const contentDir =
  process.env.CONTENT_DIR ?? resolve(appDir, "../../packages/content-dev/articles");
const config = {
  define: {
    __DEPLOY_ENV__: JSON.stringify(process.env.DEPLOY_ENV ?? "local"),
  },
  resolve: {
    alias: {
      "@": resolve(appDir, "src"),
      "@content": resolve(appDir, "../../contents"),
    },
  },
  plugins: [
    mimifuwaccContent({
      srcDir: contentDir,
      collections: {
        blogs: { source: "blogs/**/*", include: ["html"] },
        works: { source: "works/**/*", include: ["html"] },
      },
    }),
    contentDevApi(),
    voidPlugin(),
    ...voidVue({ viewTransitions: true }),
  ],
};

export default defineConfig(config).withVue({
  compiler: {},
  typeChecker: { strict: true },
  linter: { preset: "essential" },
  formatter: { printWidth: 100, tabWidth: 2 },
});
