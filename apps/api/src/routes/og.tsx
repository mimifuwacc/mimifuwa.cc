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

const OG_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=31536000, immutable",
};

export async function handleOgImage(
  slug: string,
  db: DB,
  r2: R2Bucket,
): Promise<Response> {
  const r2Key = `og/${slug}.png`;

  const cached = await r2.get(r2Key);
  if (cached) {
    return new Response(cached.body, { headers: OG_HEADERS });
  }

  try {
    const service = new BlogPostService(db);
    const post = await service.findBySlug(slug);
    if (!post) {
      return Response.redirect("https://mimifuwa.cc/og.png", 302);
    }

    const fontData = await loadFont();
    const imageResponse = new ImageResponse(
      buildOgElement(post.title, post.tags.map((t) => t.name)) as never,
      {
        width: 1200,
        height: 630,
        fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }],
      },
    );

    const imageBytes = await imageResponse.arrayBuffer();
    await r2.put(r2Key, imageBytes, { httpMetadata: { contentType: "image/png" } });

    return new Response(imageBytes, { headers: OG_HEADERS });
  } catch {
    return new Response(null, { status: 503 });
  }
}
