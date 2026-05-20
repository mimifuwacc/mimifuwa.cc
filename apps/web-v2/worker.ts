import { createHandler } from "haribote";
import config from "./metadata.config";

type Env = {
  ASSETS: { fetch(req: Request | string): Promise<Response> };
};

interface OgpData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}

const ogpCache = new Map<string, { data: OgpData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 24 * 1000;

function extractMeta(html: string, selector: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]*${selector}=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  return html.match(regex)?.[1] ?? null;
}

function parseOgp(html: string, url: string): OgpData {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title =
    extractMeta(html, "property", "og:title") ||
    extractMeta(html, "name", "twitter:title") ||
    titleMatch?.[1]?.trim() ||
    "";

  const description =
    extractMeta(html, "property", "og:description") ||
    extractMeta(html, "name", "twitter:description") ||
    extractMeta(html, "name", "description") ||
    "";

  let image =
    extractMeta(html, "property", "og:image") ||
    extractMeta(html, "name", "twitter:image") ||
    "";
  if (image && !image.startsWith("http")) {
    image = new URL(image, url).toString();
  }

  const siteName = extractMeta(html, "property", "og:site_name") || "";

  return { url, title, description, image, siteName };
}

async function handleOgp(urlParam: string | null): Promise<Response> {
  if (!urlParam) {
    return Response.json({ error: "URL parameter is required" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlParam);
  } catch {
    return Response.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const cached = ogpCache.get(urlParam);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json(cached.data);
  }

  try {
    const response = await fetch(urlParam, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OGP-Fetcher/1.0; +https://mimifuwa.cc)",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) throw new Error("Not HTML content");

    const html = await response.text();
    const ogpData = parseOgp(html, urlParam);
    ogpCache.set(urlParam, { data: ogpData, timestamp: Date.now() });
    return Response.json(ogpData);
  } catch {
    const fallback: OgpData = { url: urlParam, title: parsedUrl.hostname };
    return Response.json(fallback);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/ogp") {
      return handleOgp(url.searchParams.get("url"));
    }

    if (/\.[^./]+$/.test(url.pathname) && !url.pathname.endsWith(".html")) {
      return env.ASSETS.fetch(request);
    }

    return createHandler(config, async () => {
      const res = await env.ASSETS.fetch(new URL("/index.html", request.url).toString());
      return res.text();
    })(request);
  },
};
