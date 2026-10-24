import { storage } from "void/storage";

export const contentRoot = "mimifuwa-cc-content/";

export function isSafeContentPath(path: string): boolean {
  return (
    (path === "search-index.json" ||
      /^blogs\/[a-zA-Z0-9._/-]+$/.test(path) ||
      /^assets\/ox-content-[a-zA-Z0-9._-]+$/.test(path)) &&
    !path.split("/").some((segment) => segment === "." || segment === "..")
  );
}

export function contentTypeFor(path: string): string {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

export async function getPublishedContent(path: string): Promise<Response | null> {
  const pointer = await storage.get(`${contentRoot}current.json`);
  if (!pointer) return null;

  const { revision } = (await pointer.json<{ revision: string }>()) ?? {};
  if (!revision || !/^[a-f0-9]{7,64}$/.test(revision)) return null;

  const object = await storage.get(`${contentRoot}${revision}/${path}`);
  if (!object) return null;

  return new Response(object.body, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "Content-Type": contentTypeFor(path),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
