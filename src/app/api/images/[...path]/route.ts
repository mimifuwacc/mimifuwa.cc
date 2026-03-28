import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const imagePath = resolvedParams.path.join("/");

  try {
    const { env } = await getCloudflareContext({ async: true });

    // R2から画像を取得
    const object = await env.BLOGS.get(`images/${imagePath}`);

    if (!object) {
      return new Response("Image not found", { status: 404 });
    }

    // コンテンツタイプを推測（R2のメタデータから取得できればベスト）
    const ext = imagePath.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      avif: "image/avif",
    };

    const contentType =
      object.httpMetadata?.contentType ||
      contentTypeMap[ext || ""] ||
      "image/jpeg";

    // 画像データを取得
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // R2オブジェクトからbodyを取得
    const body = await object.arrayBuffer();

    return new Response(body, { headers });
  } catch (error) {
    console.error("Failed to fetch image from R2:", error);
    return new Response("Failed to fetch image", { status: 500 });
  }
}
