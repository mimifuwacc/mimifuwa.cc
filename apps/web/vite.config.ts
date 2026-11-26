import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { mimifuwaccContent } from "../../packages/cli/src/vite";
import { defineConfig } from "@vizejs/vite-plugin/vite-plus";
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
const config = {
  define: {
    __DEPLOY_ENV__: JSON.stringify(process.env.DEPLOY_ENV ?? "local"),
    __SITE_ORIGIN__: JSON.stringify(process.env.SITE_URL ?? ""),
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      "@": resolve(appDir, "src"),
      "@content-data": contentDataDir,
    },
  },
  plugins: [
    mimifuwaccContent({
      target: { url: process.env.SITE_URL ?? "" },
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
