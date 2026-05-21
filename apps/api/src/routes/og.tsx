/** @jsxImportSource react */
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { BlogPostService } from "../services/blog-post";
import type { DB } from "../db";

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff",
  );
  fontCache = await res.arrayBuffer();
  return fontCache;
}

function OgImage({ title }: { title: string }) {
  const display = title.length > 60 ? `${title.slice(0, 60)}…` : title;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#141414",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 8,
          height: "100%",
          background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          width: "100%",
          height: "100%",
        }}
      >
        <span style={{ fontSize: 22, color: "#4b5563", letterSpacing: 3 }}>mimifuwa.cc</span>
        <span style={{ fontSize: 54, fontWeight: 700, color: "#f9fafb", lineHeight: 1.4 }}>
          {display}
        </span>
      </div>
    </div>
  );
}

export async function handleOgImage(slug: string, db: DB): Promise<Response> {
  try {
    const service = new BlogPostService(db);
    const post = await service.findBySlug(slug);
    const title = post?.title ?? "mimifuwa.cc";

    const fontData = await loadFont();

    return new ImageResponse(<OgImage title={title} />, {
      width: 1200,
      height: 630,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }],
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
