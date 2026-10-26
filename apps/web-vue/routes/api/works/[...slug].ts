import { defineHandler } from "void";
import { contentUrl, readActiveContentJson, rewriteContentAssetUrls } from "@/content-store";
import { fixtures, isDevContent } from "@/server-content";

interface WorkRecord {
  url: string;
  [key: string]: unknown;
}

export const GET = defineHandler(async (c) => {
  if (isDevContent) {
    const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
    const work = fixtures.workContent.find((item) => item.url === `/works/${slug}/`);
    return work ? c.json(work) : c.json({ error: "not_found" }, 404);
  }

  const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
  const result = await readActiveContentJson<WorkRecord[]>("works/content.json");
  if (result.status === "unpublished") return c.json({ error: "not_found" }, 404);
  if (result.status === "missing") return c.json({ error: "content_unavailable" }, 503);

  const work = result.value.find((item) => item.url === contentUrl("works", slug));
  if (!work) return c.json({ error: "not_found" }, 404);

  if (typeof work.html === "string") {
    work.html = rewriteContentAssetUrls(work.html);
  }

  return c.json(work, 200, {
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
  });
});
