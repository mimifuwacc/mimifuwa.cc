import { type NextRequest, NextResponse } from "next/server";

export interface OgpData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}

// 簡単なインメモリキャッシュ（本番環境ではRedisなどを使用）
const cache = new Map<string, { data: OgpData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 24; // 24時間

function getCachedData(url: string): OgpData | null {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL * 1000) {
    return cached.data;
  }
  return null;
}

function setCachedData(url: string, data: OgpData): void {
  cache.set(url, { data, timestamp: Date.now() });
}

function extractMetaTags(html: string, selector: string, property: string) {
  const regex = new RegExp(
    `<meta[^>]*${selector}=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractTitle(html: string): string {
  // titleタグを優先
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  // og:title
  const ogTitle = extractMetaTags(html, "property", "og:title");
  if (ogTitle) return ogTitle;

  // twitter:title
  const twitterTitle = extractMetaTags(html, "name", "twitter:title");
  if (twitterTitle) return twitterTitle;

  return "";
}

function extractDescription(html: string): string {
  // og:descriptionを優先
  const ogDesc = extractMetaTags(html, "property", "og:description");
  if (ogDesc) return ogDesc;

  // twitter:description
  const twitterDesc = extractMetaTags(html, "name", "twitter:description");
  if (twitterDesc) return twitterDesc;

  // 通常のdescription
  const metaDesc = extractMetaTags(html, "name", "description");
  if (metaDesc) return metaDesc;

  return "";
}

function extractImage(html: string): string {
  // og:imageを優先
  const ogImage = extractMetaTags(html, "property", "og:image");
  if (ogImage) return ogImage;

  // twitter:image
  const twitterImage = extractMetaTags(html, "name", "twitter:image");
  if (twitterImage) return twitterImage;

  return "";
}

function extractSiteName(html: string): string {
  // og:site_nameを優先
  const ogSiteName = extractMetaTags(html, "property", "og:site_name");
  if (ogSiteName) return ogSiteName;

  return "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 },
    );
  }

  // URLのバリデーション
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  // キャッシュチェック
  const cachedData = getCachedData(url);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    // User-Agentを設定してブロックされるのを防ぐ
    // Accept-Languageを英語に設定して英語のOGP情報を取得
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; OGP-Fetcher/1.0; +https://mimifuwa.cc)",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000), // 10秒でタイムアウト
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new Error("Not HTML content");
    }

    const html = await response.text();

    // OGP情報を抽出
    const ogpData: OgpData = {
      url,
      title: extractTitle(html),
      description: extractDescription(html),
      image: extractImage(html),
      siteName: extractSiteName(html),
    };

    // 絶対URLに変換
    if (ogpData.image && !ogpData.image.startsWith("http")) {
      const baseUrl = new URL(url);
      ogpData.image = new URL(ogpData.image, baseUrl).toString();
    }

    // キャッシュに保存
    setCachedData(url, ogpData);

    return NextResponse.json(ogpData);
  } catch (error) {
    console.error("Failed to fetch OGP:", error);

    // エラー時は最低限の情報を返す
    const fallbackData: OgpData = {
      url,
      title: new URL(url).hostname,
    };

    return NextResponse.json(fallbackData);
  }
}
