import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { oxContent } from "@ox-content/vite-plugin";
import { defineConfig } from "vite-plus";
import { createMimifuwaTheme } from "./src/content-theme";

const appDir = dirname(fileURLToPath(import.meta.url));
const contentDir =
  process.env.CONTENT_DIR ?? resolve(appDir, "../../../mimifuwa.cc-content/articles");
const siteStyles = readFileSync(resolve(appDir, "styles/mimifuwa-cc.css"), "utf8");

export default defineConfig({
  plugins: [
    vue(),
    oxContent({
      srcDir: contentDir,
      outDir: "dist",
      highlight: true,
      search: true,
      i18n: {
        enabled: true,
        defaultLocale: "ja",
        locales: [{ code: "ja", name: "日本語" }],
      },
      publishState: true,
      ogImage: true,
      docs: false,
      ssg: {
        extension: ".html",
        clean: false,
        siteName: "mimifuwa.cc",
        siteUrl: "https://mimifuwa.cc",
        render: createMimifuwaTheme(siteStyles),
        readerChrome: false,
      },
    }),
  ],
});
