import { defineConfig } from "vite-plus";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  build: {
    ssr: "src/build.tsx",
    outDir: ".vite",
    rollupOptions: {
      external: [/^node:/, /^@ox-content\/napi$/],
      output: {
        entryFileNames: "build.js",
      },
    },
    target: "node24",
  },
});
