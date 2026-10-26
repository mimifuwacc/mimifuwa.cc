import { defineHandler } from "void";
import { contentUrl, readActiveContentJson, rewriteContentAssetUrls } from "@/content-store";
import { fixtures, isDevContent } from "@/server-content";

interface BlogArticle {
  url: string;
  [key: string]: unknown;
}

export const GET = defineHandler(async (c) => {
  if (isDevContent) {
    const slug = c.req.param("slug") ?? "";
    const url = `/blogs/${slug.replace(/^\/+|\/+$/g, "")}/`;
    const article = fixtures.blogContent.find((item) => item.url === url);
    return article ? c.json(article) : c.json({ error: "not_found" }, 404);
  }

  const slug = c.req.param("slug") ?? "";
  const result = await readActiveContentJson<BlogArticle[]>("blogs/content.json");
  if (result.status === "unpublished") return c.json({ error: "not_found" }, 404);
  if (result.status === "missing") return c.json({ error: "content_unavailable" }, 503);

  const article = result.value.find((item) => item.url === contentUrl("blogs", slug));
  if (!article) return c.json({ error: "not_found" }, 404);

  if (typeof article.html === "string") {
    article.html = rewriteContentAssetUrls(article.html);
  }

  return c.json(article, 200, {
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
  });
});
