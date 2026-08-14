export interface OgpData {
  readonly url: string;
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly siteName?: string;
}

const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const PRIVATE_IPV4 = /^(?:127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

const publicHttpUrl = (source: string, base?: URL): URL | null => {
  let url: URL;
  try {
    url = base ? new URL(source, base) : new URL(source);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "::1" ||
    hostname === "0.0.0.0" ||
    PRIVATE_IPV4.test(hostname)
  ) {
    return null;
  }
  return url;
};

const decodeEntities = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

const meta = (html: string, key: string) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"),
  ];
  const value = patterns.map((pattern) => html.match(pattern)?.[1]).find(Boolean);
  return value ? decodeEntities(value.trim()) : undefined;
};

const fetchHtml = async (initial: URL): Promise<{ html: string; url: URL }> => {
  let url = initial;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetch(url, {
      headers: {
        "accept-language": "ja,en-US;q=0.9,en;q=0.8",
        "user-agent": "Mozilla/5.0 (compatible; mimifuwa.cc OGP/2.0)",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      const redirected = location ? publicHttpUrl(location, url) : null;
      if (!redirected || redirects === MAX_REDIRECTS) throw new Error("Invalid redirect");
      url = redirected;
      continue;
    }
    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
      throw new Error("Upstream is not HTML");
    }
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > MAX_HTML_BYTES) throw new Error("Upstream HTML is too large");
    const html = await response.text();
    if (new TextEncoder().encode(html).byteLength > MAX_HTML_BYTES) {
      throw new Error("Upstream HTML is too large");
    }
    return { html, url };
  }
  throw new Error("Too many redirects");
};

export const getOgp = async (source: string): Promise<OgpData | null> => {
  const requested = publicHttpUrl(source);
  if (!requested) return null;

  try {
    const { html, url } = await fetchHtml(requested);
    const rawImage = meta(html, "og:image") ?? meta(html, "twitter:image");
    const imageUrl = rawImage ? publicHttpUrl(rawImage, url) : null;
    return {
      url: requested.toString(),
      title:
        meta(html, "og:title") ??
        meta(html, "twitter:title") ??
        (decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "") ||
          requested.hostname),
      description:
        meta(html, "og:description") ??
        meta(html, "twitter:description") ??
        meta(html, "description"),
      image: imageUrl?.toString(),
      siteName: meta(html, "og:site_name"),
    };
  } catch {
    return { url: requested.toString(), title: requested.hostname };
  }
};
