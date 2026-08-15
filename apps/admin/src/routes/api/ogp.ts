import { createFileRoute } from "@tanstack/react-router";

type OgpData = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
};
const cache = new Map<string, { data: OgpData; timestamp: number }>();
const readMeta = (html: string, attr: "property" | "name", name: string) =>
  html.match(
    new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"),
  )?.[1] ?? "";
const firstMeta = (html: string, ...names: string[]) =>
  names
    .map((name) => readMeta(html, name.includes(":") ? "property" : "name", name))
    .find(Boolean) ?? "";

export const Route = createFileRoute("/api/ogp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url).searchParams.get("url");
        if (!url) return Response.json({ error: "URL parameter is required" }, { status: 400 });
        try {
          new URL(url);
        } catch {
          return Response.json({ error: "Invalid URL format" }, { status: 400 });
        }
        const cached = cache.get(url);
        if (cached && Date.now() - cached.timestamp < 86_400_000) return Response.json(cached.data);
        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; OGP-Fetcher/1.0; +https://mimifuwa.cc)",
              "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            },
            redirect: "follow",
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok || !(response.headers.get("content-type") ?? "").includes("text/html"))
            throw new Error("Not HTML content");
          const html = await response.text();
          const data: OgpData = {
            url,
            title:
              html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
              firstMeta(html, "og:title", "twitter:title"),
            description: firstMeta(html, "og:description", "twitter:description", "description"),
            image: firstMeta(html, "og:image", "twitter:image"),
            siteName: firstMeta(html, "og:site_name"),
          };
          if (data.image && !data.image.startsWith("http"))
            data.image = new URL(data.image, url).toString();
          cache.set(url, { data, timestamp: Date.now() });
          return Response.json(data);
        } catch {
          return Response.json({ url, title: new URL(url).hostname } satisfies OgpData);
        }
      },
    },
  },
});
