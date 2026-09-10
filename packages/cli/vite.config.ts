import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    ssr: "src/index.ts",
    rollupOptions: {
      external: [/^node:/],
      output: {
        entryFileNames: "index.js",
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    target: "node24",
  },
});
