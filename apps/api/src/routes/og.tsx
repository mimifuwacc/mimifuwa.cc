import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { BlogPostService } from "../services/blog-post";
import type { DB } from "../db";
import { buildOgElement } from "./og-template";

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff",
  );
  fontCache = await res.arrayBuffer();
  return fontCache;
}

export async function handleOgImage(slug: string, db: DB): Promise<Response> {
  try {
    const service = new BlogPostService(db);
    const post = await service.findBySlug(slug);
    if (!post) {
      return Response.redirect("https://mimifuwa.cc/og.png", 302);
    }
    const title = post.title;
    const tags = post.tags.map((t) => t.name);
    const fontData = await loadFont();

    return new ImageResponse(buildOgElement(title, tags) as never, {
      width: 1200,
      height: 630,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }],
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
