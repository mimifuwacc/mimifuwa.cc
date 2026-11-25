import { defineHandler } from "void";
import { readActiveContentJson } from "@/content-store";

const isSafeHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !hostname.startsWith("[") &&
      !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) &&
      hostname !== "localhost" &&
      !hostname.endsWith(".localhost") &&
      !hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
};

export const GET = defineHandler(async (c) => {
  const requestUrl = new URL(c.req.url);
  const source = requestUrl.searchParams.get("url");
  if (!source || source.length > 2048 || !isSafeHttpsUrl(source)) {
    return new Response(null, { status: 400 });
  }

  const normalizedSource = new URL(source).href;
  const allowedImages = await readActiveContentJson<string[]>("og-image-urls.json");
  if (allowedImages.status !== "ready" || !allowedImages.value.includes(normalizedSource)) {
    return new Response(null, { status: 404 });
  }

  const cacheKey = new Request(
    new URL(`/api/og-image?url=${encodeURIComponent(normalizedSource)}`, requestUrl.origin),
  );
  const cache =
    typeof caches === "undefined"
      ? undefined
      : (caches as CacheStorage & { default?: Cache }).default;
  const cached = await cache?.match(cacheKey);
  if (cached) return cached;

  let upstreamUrl = new URL(normalizedSource);
  let upstream: Response | undefined;
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    upstream = await fetch(upstreamUrl, {
      headers: { accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
      redirect: "manual",
    });
    if (upstream.status < 300 || upstream.status >= 400) break;

    const location = upstream.headers.get("location");
    if (!location || redirect === 3) return new Response(null, { status: 502 });
    upstreamUrl = new URL(location, upstreamUrl);
    if (!isSafeHttpsUrl(upstreamUrl.href)) return new Response(null, { status: 502 });
  }

  if (!upstream?.ok || !upstream.body) return new Response(null, { status: 502 });
  const contentType = upstream.headers.get("content-type")?.split(";", 1)[0].trim();
  if (!contentType?.startsWith("image/")) return new Response(null, { status: 502 });

  const contentLengthHeader = upstream.headers.get("content-length");
  const contentLength = contentLengthHeader === null ? undefined : Number(contentLengthHeader);
  if (
    contentLength !== undefined &&
    Number.isFinite(contentLength) &&
    contentLength > 20 * 1024 * 1024
  ) {
    return new Response(null, { status: 413 });
  }

  const reader = upstream.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 20 * 1024 * 1024) {
      await reader.cancel();
      return new Response(null, { status: 413 });
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const headers = new Headers({
    "cache-control": "public, max-age=86400",
    "content-type": contentType,
    "x-content-type-options": "nosniff",
  });
  const response = new Response(body, { headers });
  if (cache) await cache.put(cacheKey, response.clone());
  return response;
});
