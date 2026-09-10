import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [/^node:/],
      output: {
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    target: "node24",
  },
});
