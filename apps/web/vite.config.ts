import { defineConfig } from "vite-plus";

export default defineConfig({
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
