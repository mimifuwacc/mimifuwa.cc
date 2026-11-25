import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { mimifuwaccContent } from "../../packages/cli/src/vite";
import { defineConfig } from "@vizejs/vite-plugin/vite-plus";
import type { Plugin } from "vite-plus";
import { voidVue } from "@void/vue/plugin";
import { voidPlugin } from "void";

const appDir = dirname(fileURLToPath(import.meta.url));
const appVersion = (() => {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;

  try {
    return execFileSync("git", ["describe", "--tags", "--abbrev=0"], {
      cwd: appDir,
      encoding: "utf8",
    }).trim();
  } catch {
    return "dev";
  }
})();
const contentDir =
  process.env.CONTENT_DIR ?? resolve(appDir, "../../packages/content-dev/articles");
const contentDataDir =
  process.env.CONTENT_DATA_DIR ?? resolve(appDir, "../../packages/content-dev/data");
const contentPreviewHmr: Plugin = {
  name: "mimifuwa-content-preview-hmr",
  handleHotUpdate({ file, server }) {
    const isMarkdownContent = file.startsWith(`${contentDir}/`) && /\.mdx?$/.test(file);
    if (!isMarkdownContent) return;

    server.ws.send({ type: "full-reload" });
    return [];
  },
  configureServer(server) {
    server.watcher.add(contentDir);
  },
};
const config = {
  define: {
    __DEPLOY_ENV__: JSON.stringify(process.env.DEPLOY_ENV ?? "local"),
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      "@": resolve(appDir, "src"),
      "@content-data": contentDataDir,
    },
  },
  plugins: [
    contentPreviewHmr,
    mimifuwaccContent({
      target: {
        url:
          process.env.DEPLOY_ENV === "dev"
            ? "https://mimifuwa-cc-dev.m8c.workers.dev"
            : "https://mimifuwa-cc-prod.m8c.workers.dev",
      },
      srcDir: contentDir,
      collections: {
        posts: { source: "posts/**/*", include: ["html"] },
        works: { source: "works/**/*", include: ["html"] },
      },
    }),
    voidPlugin(),
    ...voidVue(),
  ],
};

export default defineConfig(config).withVue({
  compiler: {},
  typeChecker: { strict: true },
  linter: { preset: "essential" },
  formatter: { printWidth: 100, tabWidth: 2 },
});
