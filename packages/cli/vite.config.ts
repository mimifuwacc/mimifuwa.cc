import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    ssr: "src/index.ts",
    rollupOptions: {
      external: [/^node:/, /^@ox-content\/napi$/],
      output: {
        entryFileNames: "index.js",
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    target: "node24",
  },
});
