import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { metaSSR } from "haribote";
import { defineConfig, type Plugin } from "vite";

function ogpDevPlugin(): Plugin {
  return {
    name: "ogp-dev",
    configureServer(server) {
      server.middlewares.use("/api/ogp", async (req, res) => {
        const urlParam = new URL(req.url ?? "", "http://localhost").searchParams.get("url");
        if (!urlParam) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "URL parameter is required" }));
          return;
        }
        let parsedUrl: URL;
        try { parsedUrl = new URL(urlParam); } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid URL format" }));
          return;
        }
        try {
          const r = await fetch(urlParam, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; OGP-Fetcher/1.0)" },
            signal: AbortSignal.timeout(10000),
          });
          const ct = r.headers.get("content-type") ?? "";
          if (!r.ok || !ct.includes("text/html")) throw new Error("not html");
          const html = await r.text();
          const get = (sel: string, prop: string) =>
            html.match(new RegExp(`<meta[^>]*${sel}=["']${prop}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"))?.[1] ?? null;
          let image = get("property", "og:image") ?? get("name", "twitter:image") ?? "";
          if (image && !image.startsWith("http")) image = new URL(image, urlParam).toString();
          const data = {
            url: urlParam,
            title: get("property", "og:title") ?? get("name", "twitter:title") ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "",
            description: get("property", "og:description") ?? get("name", "twitter:description") ?? get("name", "description") ?? "",
            image,
            siteName: get("property", "og:site_name") ?? "",
          };
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data));
        } catch {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ url: urlParam, title: parsedUrl.hostname }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), metaSSR(), ogpDevPlugin()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@contents": resolve(__dirname, "../../contents"),
    },
  },
});
