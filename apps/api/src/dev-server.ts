import { serve } from "@hono/node-server";
import { getPlatformProxy } from "wrangler";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createApp } from "./app";
import { createDB } from "./db";
import { buildOgElement } from "./routes/og-template";
import { BlogPostService } from "./services/blog-post";
import type { Env } from "./types";

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff",
  );
  fontCache = await res.arrayBuffer();
  return fontCache;
}

(async () => {
  const { env, dispose } = await getPlatformProxy<Env>();

  const app = createApp();

  // ローカルでは satori で SVG を返す（WASM 不要）
  app.get("/og/:slug", async (c) => {
    try {
      const slug = c.req.param("slug");
      const db = createDB(env);
      const service = new BlogPostService(db);
      const post = await service.findBySlug(slug);
      const title = post?.title ?? "mimifuwa.cc";
      const fontData = await loadFont();

      const svg = await satori(buildOgElement(title) as never, {
        width: 1200,
        height: 630,
        fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }],
      });

      const png = new Resvg(svg).render().asPng();
      return new Response(png.buffer as ArrayBuffer, {
        headers: { "Content-Type": "image/png" },
      });
    } catch {
      return new Response(null, { status: 503 });
    }
  });

  const server = serve(
    {
      fetch: (request) => app.fetch(request, env),
      port: 8000,
    },
    () => console.log("API running on http://localhost:8000"),
  );

  process.on("SIGINT", async () => {
    await dispose();
    server.close();
  });
})();
