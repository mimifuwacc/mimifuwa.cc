import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mimifuwa.cc",
  output: "server",
  adapter: cloudflare(),
});
