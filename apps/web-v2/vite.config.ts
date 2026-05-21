import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { metaSSR } from "haribote";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss(), metaSSR()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@contents": resolve(__dirname, "../../contents"),
    },
  },
});
