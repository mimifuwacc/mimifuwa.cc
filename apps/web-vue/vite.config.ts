import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineTheme, defaultTheme, oxContent } from "@ox-content/vite-plugin";
import { defineConfig } from "vite-plus";

const appDir = dirname(fileURLToPath(import.meta.url));
const contentDir =
  process.env.CONTENT_DIR ?? resolve(appDir, "../../../mimifuwa.cc-content/articles");

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
        theme: defineTheme({
          extends: defaultTheme,
          colors: {
            primary: "#d979a8",
            background: "#fffafd",
            backgroundAlt: "#fff2f8",
            text: "#342a31",
            textMuted: "#80717b",
            border: "#f1dce7",
          },
          fonts: {
            sans: '"Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif',
            mono: '"SFMono-Regular", Consolas, monospace',
          },
        }),
      },
    }),
  ],
});
