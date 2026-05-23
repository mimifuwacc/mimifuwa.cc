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

export async function handleOgImage(request: Request, slug: string, db: DB): Promise<Response> {
  const cache = typeof caches !== "undefined" ? (caches as unknown as { default: Cache }).default : null;

  if (cache) {
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  try {
    const service = new BlogPostService(db);
    const post = await service.findBySlug(slug);
    if (!post) {
      return Response.redirect("https://mimifuwa.cc/og.png", 302);
    }
    const title = post.title;
    const tags = post.tags.map((t) => t.name);
    const fontData = await loadFont();

    const imageResponse = new ImageResponse(buildOgElement(title, tags) as never, {
      width: 1200,
      height: 630,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }],
    });

    const result = new Response(imageResponse.body, {
      status: imageResponse.status,
      headers: {
        ...Object.fromEntries(imageResponse.headers.entries()),
        "Cache-Control": "public, max-age=31536000",
      },
    });

    if (cache) {
      await cache.put(request, result.clone());
    }

    return result;
  } catch {
    return new Response(null, { status: 503 });
  }
}

export async function purgeOgCache(origin: string, slug: string): Promise<void> {
  if (typeof caches === "undefined") return;
  await (caches as unknown as { default: Cache }).default.delete(`${origin}/og/${slug}`);
}
