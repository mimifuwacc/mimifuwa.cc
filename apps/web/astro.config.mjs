import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mimifuwa.cc",
  output: "server",
  adapter: cloudflare(),
  vite: {
    resolve: {
      alias: {
        "date-fns/format/index.js": "date-fns/esm/format/index.js",
      },
    },
    ssr: {
      noExternal: ["astro-tweet", "date-fns"],
    },
  },
});
